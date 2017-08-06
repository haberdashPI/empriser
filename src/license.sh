npm install -g license-checker
license-checker --production --json > license.json

# NOTE: you will probably have to modify the output of license.json before
# running the below python script.  It is really a manual process. This script here is
# merely to document most of the steps required to generate the 3rd party
# licenses.
python src/generate-license.py
