type PlanFeature = {
  id?: number | string
  unique_id?: string
  feature_key: string
  feature_value: boolean | number | string
}

export type Plan = {
  id?: number | string
  unique_id?: string
  name: string
  price: number | null
  duration_days: number | null
  is_active: boolean | number | null
}

const normalizePlans = (payload: any): Plan[] => {
  const list =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.plans) && payload.plans) ||
    []
  return (list as any[]).filter(Boolean)
}

const normalizeFeatures = (payload: any): PlanFeature[] => {
  const list =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.features) && payload.features) ||
    []
  return (list as any[]).filter(Boolean)
}

export const adminPlansEndpoint = '/admin/plans'
export const adminPlanEndpoint = (planId: string) =>
  `/admin/plans/${encodeURIComponent(planId)}`
export const adminPlanFeaturesEndpoint = (planId: string) =>
  `/admin/plans/${encodeURIComponent(planId)}/features`
export const adminPlanFeatureEndpoint = (planId: string, featureId: string) =>
  `/admin/plans/${encodeURIComponent(planId)}/features/${encodeURIComponent(featureId)}`

export function useAdminPlans() {
  const { $axios } = useNuxtApp()

  const { data, pending, error, refresh } = useAsyncData<Plan[]>(
    'admin:plans',
    async () => {
      const response = await $axios.get(adminPlansEndpoint)
      return normalizePlans(response.data)
    },
  )

  const plans = computed(() => data.value ?? [])

  return {
    endpoint: adminPlansEndpoint,
    plans,
    pending,
    error,
    refresh,
    actions: {
      createPlan: (payload: Partial<Plan>) =>
        $axios.post(adminPlansEndpoint, payload),
      updatePlan: (planId: string, payload: Partial<Plan>) =>
        $axios.put(adminPlanEndpoint(planId), payload),
      deletePlan: (planId: string) => $axios.delete(adminPlanEndpoint(planId)),
      listFeatures: (planId: string) =>
        $axios.get(adminPlanFeaturesEndpoint(planId)),
      createFeature: (planId: string, payload: Partial<PlanFeature>) =>
        $axios.post(adminPlanFeaturesEndpoint(planId), payload),
      updateFeature: (
        planId: string,
        featureId: string,
        payload: Partial<PlanFeature>,
      ) => $axios.put(adminPlanFeatureEndpoint(planId, featureId), payload),
      deleteFeature: (planId: string, featureId: string) =>
        $axios.delete(adminPlanFeatureEndpoint(planId, featureId)),
    },
    normalizeFeatures,
  }
}
