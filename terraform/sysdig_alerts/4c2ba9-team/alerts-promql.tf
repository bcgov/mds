# As of September 15th, 2022, the notification channel  id for Discord notifications
# is 77077. If you need to create a new channel, use the following request 

# curl -X GET https://app.sysdigcloud.com/api/notificationChannels -H 'Authorization: Bearer <sysdig_api_token>'

# to get the notification channel id and use that id for each of the alerts here.


# Refer here for severity and status codes: https://docs.sysdig.com/en/docs/sysdig-monitor/events/severity-and-status/

# TODO: Separate resources by Kubernetes resource type

resource "sysdig_monitor_alert_promql" "KubernetesNodeReady" {
  name                  = "KubernetesNodeReady"
  severity              = 2
  enabled               = true
  promql                = "kube_node_status_condition{condition=\"Ready\",status="true"} == 0"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\nNode {{ $labels.node }} has been unready for a long time\nVALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesDeploymentReplicasMismatch" {
  name = "KubernetesDeploymentReplicasMismatch"
  description = "Available replicas do not match specified replicas"
  severity = 4
  enabled = true
  promql = "kube_deployment_spec_replicas != kube_deployment_status_replicas_available"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesMemoryPressure" {
  name = "KubernetesMemoryPressure"
  severity = 2
  enabled = true
  promql = "kube_node_status_condition{condition=\"MemoryPressure\",status="true"} == 1"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\n{{ $labels.node }} has MemoryPressure condition\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesDiskPressure" {
  name = "KubernetesDiskPressure"
  severity = 2
  enabled = true
  promql = "kube_node_status_condition{condition=\"DiskPressure\",status="true"} == 1"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\n{{ $labels.node }} has DiskPressure condition\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesOutOfDisk" {
  name = "KubernetesOutOfDisk"
  severity = 2
  enabled = true
  promql = "kube_node_status_condition{condition=\"OutOfDisk\",status="true"} == 1"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\n{{ $labels.node }} has OutOfDisk condition\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesOutOfCapacity" {
  name = "KubernetesOutOfCapacity"
  severity = 4
  enabled = true
  promql = "sum by (node) ((kube_pod_status_phase{phase="Running"} == 1) + on(uid) group_left(node) (0 * kube_pod_info{pod_template_hash=""})) / sum by (node) (kube_node_status_allocatable{resource=\"pods\"}) * 100 > 90"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\n{{ $labels.node }} is out of capacity\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesContainerOomKiller" {
  name = "KubernetesContainerOomKiller"
  severity = 4
  enabled = true
  promql = "(kube_pod_container_status_restarts_total - kube_pod_container_status_restarts_total offset 10m >= 1) and ignoring (reason) min_over_time(kube_pod_container_status_last_terminated_reason{reason=\"OOMKilled\"}[10m]) == 1"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\nContainer {{ $labels.container }} in pod {{ $labels.namespace }}/{{ $labels.pod }} has been OOMKilled {{ $value }} times in the last 10 minutes.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesJobFailed" {
  name = "KubernetesJobFailed"
  severity = 4
  enabled = true
  promql = "kube_job_status_failed > 0"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\nJob {{$labels.namespace}}/{{$labels.exported_job}} failed to complete\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesCronjobSuspended" {
  name = "KubernetesCronjobSuspended"
  severity = 4
  enabled = true
  promql = "kube_cronjob_spec_suspend != 0"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\nCronJob {{ $labels.namespace }}/{{ $labels.cronjob }} is suspended\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesPersistentvolumeclaimPending" {
  name = "KubernetesPersistentvolumeclaimPending"
  severity = 4
  enabled = true
  promql = "kube_persistentvolumeclaim_status_phase{phase=\"Pending\"} == 1"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}\nPersistentVolumeClaim {{ $labels.namespace }}/{{ $labels.persistentvolumeclaim }} is pending\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesVolumeOutOfDiskSpace" {
  name = "KubernetesVolumeOutOfDiskSpace"
  severity = 4
  enabled = true
  promql = "kubelet_volume_stats_available_bytes / kubelet_volume_stats_capacity_bytes * 100 < 10"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Volume is almost full (< 10% left)\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesVolumeFullInFourDays" {
  name = "KubernetesVolumeFullInFourDays"
  severity = 2
  enabled = true
  promql = "predict_linear(kubelet_volume_stats_available_bytes[6h], 4 * 24 * 3600) < 0"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "{{ $labels.namespace }}/{{ $labels.persistentvolumeclaim }} is expected to fill up within four days. Currently {{ $value | humanize }}% is available.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesPersistentvolumeError" {
  name = "KubernetesPersistentvolumeError"
  severity = 2
  enabled = true
  promql = "kube_persistentvolume_status_phase{phase=~\"Failed|Pending\", job=\"kube-state-metrics\"} > 0"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes PersistentVolume error (instance {{ $labels.instance }})\nPersistent volume is in bad state\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesStatefulsetDown" {
  name = "KubernetesStatefulsetDown"
  severity = 2
  enabled = true
  promql = "(kube_statefulset_status_replicas_ready / kube_statefulset_status_replicas_current) != 1"
  trigger_after_minutes = 1
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes StatefulSet down (instance {{ $labels.instance }})\nA StatefulSet went down\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesPodNotHealthy" {
  name = "KubernetesPodNotHealthy"
  severity = 2
  enabled = true
  promql = "min_over_time(sum by (namespace, pod) (kube_pod_status_phase{phase=~\"Pending|Unknown|Failed\"})[15m:1m]) > 0"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes Pod not healthy (instance {{ $labels.instance }})\nPod has been in a non-ready state for longer than 15 minutes.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesPodCrashLooping" {
  name = "KubernetesPodCrashLooping"
  severity = 3
  enabled = true
  promql = "increase(kube_pod_container_status_restarts_total[1m]) > 3"
  trigger_after_minutes = 2
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes pod crash looping (instance {{ $labels.instance }})\nPod {{ $labels.pod }} is crash looping\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesReplicassetMismatch" {
  name = "KubernetesReplicassetMismatch"
  severity = 4
  enabled = true
  promql = "kube_replicaset_spec_replicas != kube_replicaset_status_ready_replicas"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes ReplicasSet mismatch (instance {{ $labels.instance }})\nDeployment Replicas mismatch\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesStatefulsetReplicasMismatch" {
  name = "KubernetesStatefulsetReplicasMismatch"
  severity = 4
  enabled = true
  promql = "kube_statefulset_status_replicas_ready != kube_statefulset_status_replicas"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes StatefulSet replicas mismatch (instance {{ $labels.instance }})\nA StatefulSet does not match the expected number of replicas.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesDeploymentGenerationMismatch" {
  name = "KubernetesDeploymentGenerationMismatch"
  severity = 2
  enabled = true
  promql = "kube_deployment_status_observed_generation != kube_deployment_metadata_generation"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes Deployment generation mismatch (instance {{ $labels.instance }})\nA Deployment has failed but has not been rolled back.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesStatefulsetGenerationMismatch" {
  name = "KubernetesStatefulsetGenerationMismatch"
  severity = 2
  enabled = true
  promql = "kube_statefulset_status_observed_generation != kube_statefulset_metadata_generation"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes StatefulSet generation mismatch (instance {{ $labels.instance }})\nA StatefulSet has failed but has not been rolled back.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesStatefulsetUpdateNotRolledOut" {
  name = "KubernetesStatefulsetUpdateNotRolledOut"
  severity = 4
  enabled = true
  promql = "max without (revision) (kube_statefulset_status_current_revision unless kube_statefulset_status_update_revision) * (kube_statefulset_replicas != kube_statefulset_status_replicas_updated)"
  trigger_after_minutes = 10
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes StatefulSet update not rolled out (instance {{ $labels.instance }})\nStatefulSet update has not been rolled out.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesCronjobTooLong" {
  name = "KubernetesCronjobTooLong"
  severity = 4
  enabled = true
  promql = "time() - kube_cronjob_next_schedule_time > 3600"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes CronJob too long (instance {{ $labels.instance }})\nCronJob {{ $labels.namespace }}/{{ $labels.cronjob }} is taking more than 1h to complete.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}

resource "sysdig_monitor_alert_promql" "KubernetesJobSlowCompletion" {
  name = "KubernetesJobSlowCompletion"
  severity = 2
  enabled = true
  promql = "kube_job_spec_completions - kube_job_status_succeeded > 0"
  trigger_after_minutes = 0
  notification_channels = [77077] # Notification channel id
  custom_notification {
    title = "Kubernetes job slow completion (instance {{ $labels.instance }})\nKubernetes Job {{ $labels.namespace }}/{{ $labels.job_name }} did not complete in time.\n  VALUE = {{ $value }}"
  }
  group_name = "promql_alerts"
}
