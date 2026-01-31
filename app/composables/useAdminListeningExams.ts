type ListeningQuestion = {
  id?: number | string
  unique_id?: string
  question_type?: 'fill_blank' | string | null
  question_text: string
  correct_answer: string
  order_index?: number | null
}

type ListeningSection = {
  id?: number | string
  unique_id?: string
  title: string
  instruction?: string | null
  audio?: string | null
  order_index?: number | null
  status?: 'active' | 'inactive' | string | null
  questions?: ListeningQuestion[] | null
}

export type ListeningExam = {
  id?: number | string
  unique_id?: string
  title: string
  instruction?: string | null
  duration?: number | null
  status?: 'active' | 'inactive' | string | null
  sections?: ListeningSection[] | null
}

const normalizeExams = (payload: any): ListeningExam[] => {
  const list =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.exams) && payload.exams) ||
    []

  return (list as any[]).filter(Boolean)
}

export const adminListeningExamsEndpoint = '/admin/listening-exams'

export const adminListeningExamEndpoint = (uniqueId: string) =>
  `/admin/listening-exams/${encodeURIComponent(uniqueId)}`

export const adminListeningExamSectionsEndpoint = (examUniqueId: string) =>
  `/admin/listening-exams/${encodeURIComponent(examUniqueId)}/sections`

export const adminListeningSectionEndpoint = (sectionUniqueId: string) =>
  `/admin/listening-sections/${encodeURIComponent(sectionUniqueId)}`

export const adminListeningSectionQuestionsEndpoint = (sectionUniqueId: string) =>
  `/admin/listening-sections/${encodeURIComponent(sectionUniqueId)}/questions`

export const adminListeningQuestionEndpoint = (questionUniqueId: string) =>
  `/admin/listening-questions/${encodeURIComponent(questionUniqueId)}`

const hasInlineSections = (exam: ListeningExam) =>
  Object.prototype.hasOwnProperty.call(exam, 'sections')

const enrichWithDetailsIfNeeded = async (
  axiosClient: any,
  exams: ListeningExam[],
) => {
  if (exams.length === 0) return exams

  const anyHasSections = exams.some((e) => hasInlineSections(e))
  if (anyHasSections) return exams

  const detailIds = exams.map((e) => e.unique_id).filter(Boolean) as string[]
  if (detailIds.length !== exams.length) return exams

  const details = await Promise.all(
    detailIds.map(async (id) => {
      const response = await axiosClient.get(adminListeningExamEndpoint(id))
      return response.data
    }),
  )

  const detailedExams = normalizeExams(details)
  return detailedExams.length ? detailedExams : exams
}

export function useAdminListeningExams() {
  const { $axios } = useNuxtApp()

  const { data, pending, error, refresh } = useAsyncData<ListeningExam[]>(
    'admin:listening-exams',
    async () => {
      const response = await $axios.get(adminListeningExamsEndpoint)
      const exams = normalizeExams(response.data)
      return await enrichWithDetailsIfNeeded($axios, exams)
    },
  )

  const exams = computed(() => data.value ?? [])

  const sections = computed(() => {
    const out: Array<ListeningSection & { exam: ListeningExam }> = []
    for (const exam of exams.value) {
      for (const section of exam.sections ?? []) {
        out.push({ ...(section as ListeningSection), exam })
      }
    }
    return out
  })

  const questions = computed(() => {
    const out: Array<
      ListeningQuestion & { exam: ListeningExam; section: ListeningSection }
    > = []
    for (const exam of exams.value) {
      for (const section of exam.sections ?? []) {
        for (const question of section.questions ?? []) {
          out.push({
            ...(question as ListeningQuestion),
            exam,
            section: section as ListeningSection,
          })
        }
      }
    }
    return out
  })

  return {
    endpoint: adminListeningExamsEndpoint,
    data,
    exams,
    sections,
    questions,
    pending,
    error,
    refresh,
    actions: {
      createExam: (payload: Partial<ListeningExam>) =>
        $axios.post(adminListeningExamsEndpoint, payload),
      updateExam: (examUniqueId: string, payload: Partial<ListeningExam>) =>
        $axios.put(adminListeningExamEndpoint(examUniqueId), payload),
      deleteExam: (examUniqueId: string) =>
        $axios.delete(adminListeningExamEndpoint(examUniqueId)),
      createSection: (examUniqueId: string, payload: any) =>
        $axios.post(adminListeningExamSectionsEndpoint(examUniqueId), payload),
      updateSection: (
        sectionUniqueId: string,
        payload: Partial<ListeningSection>,
      ) => $axios.put(adminListeningSectionEndpoint(sectionUniqueId), payload),
      deleteSection: (sectionUniqueId: string) =>
        $axios.delete(adminListeningSectionEndpoint(sectionUniqueId)),
      createQuestion: (sectionUniqueId: string, payload: any) =>
        $axios.post(adminListeningSectionQuestionsEndpoint(sectionUniqueId), payload),
      updateQuestion: (
        questionUniqueId: string,
        payload: Partial<ListeningQuestion>,
      ) => $axios.put(adminListeningQuestionEndpoint(questionUniqueId), payload),
      deleteQuestion: (questionUniqueId: string) =>
        $axios.delete(adminListeningQuestionEndpoint(questionUniqueId)),
    },
  }
}
