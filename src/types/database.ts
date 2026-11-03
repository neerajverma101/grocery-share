export type List = {
  id: string
  owner_id: string | null
  title: string
  share_id: string | null
  is_public: boolean
  created_at: string
}

export type Item = {
  id: string
  list_id: string
  text: string
  is_completed: boolean
  created_at: string
  updated_at: string
}
