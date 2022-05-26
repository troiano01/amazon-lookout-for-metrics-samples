import boto3
import json
import logging
import random
import time
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):

  ad_frequency_in_seconds: int = int(event['adFrequencyInSeconds'])
  bucket_name: str = event['bucketName']
  bucket_prefix: str = event['bucketPrefix']
  database: str = event['database']
  number_of_historical_data_points: int = int(event['numberOfHistoricalDataPoints'])
  number_of_future_data_points: int = int(event['numberOfFutureDataPoints'])
  table_name: str = event['tableName']
  workgroup: str = event['workgroup']

  current_datetime_rounded_as_per_ad_frequency = \
      int(datetime.utcnow().timestamp() / ad_frequency_in_seconds) * ad_frequency_in_seconds

  end_timestamp_epoch = (current_datetime_rounded_as_per_ad_frequency + number_of_future_data_points * ad_frequency_in_seconds)
  start_timestamp_epoch = (current_datetime_rounded_as_per_ad_frequency - number_of_historical_data_points * ad_frequency_in_seconds)

  # Generating data
  for start_time_window_epoch in range(start_timestamp_epoch, end_timestamp_epoch, int(ad_frequency_in_seconds)):
      end_time_window_epoch = start_time_window_epoch + ad_frequency_in_seconds
      step_size = 3
      rand_num = random.randint(1, 500)

      data_generated = [{
        "marketplace": random.choice(["USA", "CA", "UK", "IN", "AU", "NZ", "PL", "DE", "NL", "MX"]),
        "category": random.choice(["electronics", "clothing", "household"]),
        "shippingtype": random.choice(["expedited", "regular"]),
        "revenue": (20 * random.randint(250, 500)) if (random.randint(1, 35)%7 == 0) else random.randint(1, 500),
        "orderrate": (random.randint(1000, 2000)* 40) if (random.randint(1, 50)%10 == 0) else random.randint(1000, 2000),
        "inventory": (30 * random.randint(20, 40)) if (random.randint(1, 50)%6 == 0) else random.randint(10, 50),
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(time_in_seconds))
      } for time_in_seconds in range(start_time_window_epoch, end_time_window_epoch, step_size)]

      string_data = '\n'.join(json.dumps(data) for data in data_generated)

      date_prefix = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(start_time_window_epoch))
      file_name = '{}.json'.format(date_prefix)
      partition_prefix = "timestamp={}".format(date_prefix)
      s3_path = '/'.join([bucket_prefix, partition_prefix, file_name])
      s3 = boto3.resource('s3')
      s3.Object(bucket_name, s3_path).put(Body=string_data)
      logger.info("order rate data generated in: " + s3_path)

      logger.info("Adding new partitions to {}".format(table_name))
      query_string = "ALTER TABLE {} ADD PARTITION (timestamp='{}') LOCATION 's3://{}/PT5M/timestamp={}'" \
          .format(table_name, date_prefix, bucket_name, date_prefix)

      athena = boto3.client('athena')
      athena.start_query_execution(QueryString=query_string,
                                  QueryExecutionContext={'Database': database},
                                  WorkGroup=workgroup)
  
  return { 'statusCode': 200 }