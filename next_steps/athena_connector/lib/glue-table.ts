/*
Create the Glue DB and Table.
*/
import { NestedStack, NestedStackProps, ScopedAws } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnTable, CfnDatabase } from 'aws-cdk-lib/aws-glue';

interface GlueStackProps extends NestedStackProps {
  glueDatabaseName: string;
  glueTableName: string;
  tableStorageLocation: string;
}

export class GlueStack extends NestedStack {
  public readonly glueDatabaseArn: string;
  public readonly glueTableArn: string;
  public readonly glueCatalogArn: string;
  constructor(scope: Construct, id: string, props: GlueStackProps) {
    super(scope, id, props);

    const {glueDatabaseName, glueTableName, tableStorageLocation} = props;
    const {accountId, region} = new ScopedAws(this);

    const glueDatabase = new CfnDatabase(this, 'glueDatabase', {
      catalogId: accountId,
      databaseInput: {name: glueDatabaseName}
    });

    const glueTable = new CfnTable(this, 'glueTable', {
      catalogId: accountId,
      databaseName: glueDatabaseName,
      tableInput: {
        name: glueTableName,
        tableType: 'EXTERNAL_TABLE',
        parameters: {classification: 'csv', external: 'true'},
        partitionKeys: [{name: 'timestamp', type: 'timestamp'}],
        storageDescriptor: {
          columns: [
            {name: 'marketplace', type: 'string'}, 
            {name: 'category', type: 'string'}, 
            {name: 'shippingtype', type: 'string'}, 
            {name: 'revenue', type: 'double'}, 
            {name: 'orderrate', type: 'double'}, 
            {name: 'inventory', type: 'double'}
          ],
          compressed: false,
          inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
          outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
          location: tableStorageLocation,
          serdeInfo: {
            parameters: {'paths': 'marketplace, category, shippingtype, revenue, orderrate, inventory, timestamp'},
            serializationLibrary: 'org.apache.hive.hcatalog.data.JsonSerDe'
          }
        }
      }
    });

    // Version of the glue constructs does not infer dependency
    glueTable.addDependsOn(glueDatabase);

    // Version of the glue constructs does not yet make the ARN property available
    this.glueCatalogArn = 'arn:aws:glue:' + region + ':' + accountId + ':catalog';
    this.glueDatabaseArn = 'arn:aws:glue:' + region + ':' + accountId + ':database/' + glueDatabaseName;
    this.glueTableArn = 'arn:aws:glue:' + region + ':' + accountId + ':table/' + glueDatabaseName + '/' + glueTableName;
  }
}
