#!/bin/bash
# IBM Confidential
# OCO Source Materials
#  5724-V51
#
# (c) Copyright IBM Corp. 2000, 2008 All Rights Reserved.
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
# author - bhavani eshwar
# Template to set up a shell script to invoke the command line java utility to run jobs in third party schedulers
# This Script has been tested with Tivoli Workload Scheduler(TWS) 8.2, Tivoli Managment Framework 4.1 and 
# Tivoli Language support for Management Framework 4.1

#NOTE :
# For TWS, any change in this script after you have created the Task/Job in TWS will not be picked up since TWS 
# caches the script. Its suggested that you delete the Task/Job in TWS and recreate it

# Environment setup since the third party Scheduler like TWS needs a capability of a standalone call to a java class
# with command line arguments
# Set the three envirnment variables here and uncomment the lines  
#export TOP=<Path to InfoSphere MDM Server for PIM Installation home directory> # E.g. /usr/appinstalls/mdmpim60
#CCD_INIT_VARS=$TOP/setup/init_ccd_vars.sh
#. $CCD_INIT_VARS

# Set the job related variables below as needed, uncomment the lines and do not modify anything else after this
 CCD_JOB_NAME=$2		# [Required]
 CCD_JOB_TYPE=$3		# [Required, Valid values are import|export|report]
 CCD_COMPANY_CODE=$1	# [Optional, Default Value is trigo] 
 CCD_USERNAME=Admin		# [Optional, Default Value is Admin]
 CCD_DEBUG=off			# [Optional, Default Value is off]

if [ "${CCD_JOB_NAME}" = "" ]; then
   #${ECHO} "*Error*: Job Name is not specified"
   $JAVA_RT com.ibm.ccd.common.globalization.ShellMessagePrinter --message_index=SCHEDULER_INFO_EMPTY_JOB_NAME
   exit 1
fi
if [ "${CCD_JOB_TYPE}" = "" ]; then
   #${ECHO} "*Error*: Job Type is not specified"
   $JAVA_RT com.ibm.ccd.common.globalization.ShellMessagePrinter --message_index=SCHEDULER_INFO_EMPTY_JOB_TYPE
   exit 1
fi

# We should force users to enter company code and username but for now we can leave it open. When the Class has this changed 
# we can uncomment these lines.
#if [ "$CCD_COMPANY_CODE}" = "" ]; then
#   ${ECHO} "*Error*: Company Code not specified "
#   exit 1
#fi
#if [ "$CCD_USERNAME}" = "" ]; then
#   ${ECHO} "*Error*: User Name not specified"
#   exit 1
#fi

FLAGS=""

# If company code and user name are provided only then they will be supplied 
if [ ! "${CCD_COMPANY_CODE}" = "" ]; then
    FLAGS="${FLAGS} --company_code=${CCD_COMPANY_CODE}"
fi

if [ ! "${CCD_USERNAME}" = "" ]; then
    FLAGS="${FLAGS} --username=${CCD_USERNAME}"
fi

if [ ! "${CCD_DEBUG}" = "" ]; then
    FLAGS="${FLAGS} --debug=${CCD_DEBUG}"
fi

# Now we have the command line built so we run it     
${ECHO} "${JAVA_RT} com.ibm.ccd.scheduler.common.RunJob --job_name=${CCD_JOB_NAME} --job_type=${CCD_JOB_TYPE} ${FLAGS}"
${JAVA_RT} com.ibm.ccd.scheduler.common.RunJob --job_name="${CCD_JOB_NAME}" --job_type="${CCD_JOB_TYPE}" ${FLAGS}
