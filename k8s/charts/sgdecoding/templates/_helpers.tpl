{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "sgdecoding.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "sgdecoding.fullname" -}}
{{- if $.Values.fullnameOverride -}}
{{- $.Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default $.Chart.Name $.Values.nameOverride -}}
{{- if contains $name $.Release.Name -}}
{{- $.Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" $.Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "sgdecoding.chart" -}}
{{- printf "%s-%s" $.Chart.Name $.Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "sgdecoding.labels" -}}
helm.sh/chart: {{ template "sgdecoding.chart" . }}
{{ include "sgdecoding.selectorLabels" . }}
{{- if $.Chart.AppVersion }}
app.kubernetes.io/version: {{ $.Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ $.Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "sgdecoding.selectorLabels" -}}
app.kubernetes.io/name: {{ $.Chart.Name }}
app.kubernetes.io/instance: {{ $.Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "sgdecoding.serviceAccountName" -}}
{{- if $.Values.serviceAccounts.sgdecoding.create -}}
    {{ default (include "sgdecoding.fullname" .) }}
{{- else -}}
    {{ default "default" $.Values.serviceAccounts.sgdecoding.name }}
{{- end -}}
{{- end -}}


{{/*
Define the sgdecoding.namespace template if set with forceNamespace or .Release.Namespace is set
*/}}
{{- define "sgdecoding.namespace" -}}
{{- if $.Values.namespace -}}
{{ printf "namespace: %s" $.Values.namespace }}
{{- else -}}
{{ printf "namespace: %s" $.Release.Namespace }}
{{- end -}}
{{- end -}}

{{/*
Get KubeVersion removing pre-release information.
*/}}
{{- define "stt.kubeVersion" -}}
  {{- default .Capabilities.KubeVersion.Version (regexFind "v[0-9]+\\.[0-9]+\\.[0-9]+" .Capabilities.KubeVersion.Version) -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for ingress.
*/}}
{{- define "ingress.apiVersion" -}}
{{- print "networking.k8s.io/v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for rbac.
*/}}
{{- define "rbac.apiVersion" -}}
{{- if .Capabilities.APIVersions.Has "rbac.authorization.k8s.io/v1" }}
{{- print "rbac.authorization.k8s.io/v1" -}}
{{- else -}}
{{- print "rbac.authorization.k8s.io/v1beta1" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for networkpolicy.
*/}}
{{- define "sgdecoding.networkPolicy.apiVersion" -}}
{{- print "networking.k8s.io/v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for podsecuritypolicy.
*/}}
{{- define "sgdecoding.podSecurityPolicy.apiVersion" -}}
{{- print "policy/v1beta1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for deployment.
*/}}
{{- define "sgdecoding.deployment.apiVersion" -}}
{{- print "apps/v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for daemonset.
*/}}
{{- define "sgdecoding.daemonset.apiVersion" -}}
{{- print "apps/v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for service.
*/}}
{{- define "sgdecoding.service.apiVersion" -}}
{{- print "v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for PersistentVolumeClaim.
*/}}
{{- define "sgdecoding.pvc.apiVersion" -}}
{{- print "v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for ConfigMap.
*/}}
{{- define "sgdecoding.configmap.apiVersion" -}}
{{- print "v1" -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for Secret.
*/}}
{{- define "sgdecoding.secret.apiVersion" -}}
{{- print "v1" -}}
{{- end -}}

{{/*
Return if ingress is stable.
*/}}
{{- define "ingress.isStable" -}}
  {{- eq (include "ingress.apiVersion" .) "networking.k8s.io/v1" -}}
{{- end -}}

{{/*
Return if ingress supports ingressClassName.
*/}}
{{- define "ingress.supportsIngressClassName" -}}
  {{- or (eq (include "ingress.isStable" .) "true") (and (eq (include "ingress.apiVersion" .) "networking.k8s.io/v1beta1") (semverCompare ">= 1.18.x" (include "stt.kubeVersion" .))) -}}
{{- end -}}
{{/*
Return if ingress supports pathType.
*/}}
{{- define "ingress.supportsPathType" -}}
  {{- or (eq (include "ingress.isStable" .) "true") (and (eq (include "ingress.apiVersion" .) "networking.k8s.io/v1beta1") (semverCompare ">= 1.18.x" (include "stt.kubeVersion" .))) -}}
{{- end -}}


{{/*
Define name for sgdecoding components
*/}}
{{- define "sgdecoding.backend.fullname" -}}
{{ template "sgdecoding.name" . }}-api
{{- end -}}
{{- define "sgdecoding.frontend.fullname" -}}
{{ template "sgdecoding.name" . }}-web
{{- end -}}


{{/*
Create unified labels for sgdecoding components
*/}}
{{- define "sgdecoding.common.matchLabels" -}}
{{ include "sgdecoding.selectorLabels" . }}
{{- end -}}

{{- define "sgdecoding.common.metaLabels" -}}
{{ include "sgdecoding.labels" . }}
{{- end -}}



{{- define "sgdecoding.backend.labels" -}}
{{ include "sgdecoding.common.metaLabels" . }}
{{- end -}}

{{- define "sgdecoding.backend.matchLabels" -}}
{{- printf "%s: %s" "component" "api" | trunc 63 | trimSuffix "-" }}
{{ include "sgdecoding.common.matchLabels" . }}
{{- end -}}

{{- define "sgdecoding.frontend.labels" -}}
{{ include "sgdecoding.common.metaLabels" . }}
{{- end -}}

{{- define "sgdecoding.frontend.matchLabels" -}}
{{- printf "%s: %s" "component" "web" | trunc 63 | trimSuffix "-" }}
{{ include "sgdecoding.common.matchLabels" . }}
{{- end -}}



