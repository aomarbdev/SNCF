COMPANY=bacasable
catalogname=C_B02_LieuREF

$JAVA_RT com.ibm.ccd.connectivity.common.DataImporter  -feed_type=itm  -company_code=${COMPANY}
 -catalog_name=${catalogName} -script_path=/scripts/import/ctg/pbm_migration_rel.script 
 -data_path=/public_html/envexpimp/20091007_152611temp/CATALOG_CONTENT/CATALOG_CONTENT_7402_DATA.csv

