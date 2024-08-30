# Deploy SGDecoding on Azure cloud

## ASR Speech Microservices and Applications

  ### SGDecoding
  
  1. Settings
  2. Commands to build

         cd /workspace/development/SGDecodingPortal
         
         # Frontend
         cd frontend/
         docker build -t abxregistry.azurecr.io/sgdecoding-frontend:v1.0 .

         # Backend
         docker build -t abxregistry.azurecr.io/sgdecoding-backend:v1.0 .
 
         docker push abxregistry.azurecr.io/sgdecoding-frontend:v1.0
         docker push abxregistry.azurecr.io/sgdecoding-backend:v1.0

  3. Commands to deploy

        - Create the namespace

                kubectl create namespace sgdecoding
                kubectl config set-context --current --namespace=sgdecoding

        - Render the charts into manifests and doublecheck the settings

                helm template sgdecoding -f sgdecoding/values.yaml ../charts/sgdecoding --output-dir manifests/

        - Review and Apply the manifests to deploy

                - Review the manifests
                - Apply the manifests

                        kubectl apply -f manifests/livestream-decoding/templates/

        - Check the ingress and add A record to the hosting service, example:

                NAME                CLASS   HOSTS                     ADDRESS        PORTS     AGE
                onlineasr-ingress   nginx   sgdecoding.speechlab.sg   xxx.xx.xx.xx   80, 443   18h

        - Verify the deployment. Open the webapplication in the browser

                https://sgdecoding.speechlab.sg
                


  4. Other Notes

        - Last updated: August 30, 2024.

