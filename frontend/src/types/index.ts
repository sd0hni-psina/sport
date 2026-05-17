export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  first_name: string
  last_name: string
  middle_name: string | null
  phone_number: string
  city: string
  address: string | null
  birth_date: string
  role: UserRole
  reputation: number
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export interface Child {
  id: number
  parent_id: number
  first_name: string
  last_name: string
  middle_name: string | null
  birth_date: string
  created_at: string
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export interface Event {
  id: number
  name: string
  sport_type: string
  description: string
  location: string
  location_lat: number | null
  location_lng: number | null
  time_start: string
  time_end: string
  instructor_name: string | null
  instructor_bio: string | null
  min_age: number | null
  max_age: number | null
  max_participants: number | null
  prizes: string | null
  cancel_deadline_hrs: number
  status: EventStatus
  created_at: string
  updated_at: string
}

export type ApplicationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled_by_user'
  | 'cancelled_by_admin'
  | 'no_show'
  | 'attended'

export interface Application {
  id: number
  user_id: number
  event_id: number
  child_id: number | null
  status: ApplicationStatus
  is_volunteer: boolean
  notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type AwardType = 'medal' | 'diploma' | 'certificate'

export interface Award {
  id: number
  application_id: number
  type: AwardType
  description: string
  issued_at: string
}

export interface Post {
  id: number
  title: string
  body: string
  cover_image: string | null
  event_id: number | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Section {
  id: number
  name: string
  description: string
  trainer_name: string | null
  address: string | null
  schedule: string | null
  contact: string | null
  is_partner: boolean
  created_at: string
  updated_at: string
}

export interface PublicCounters {
  total_events: number
  total_participants: number
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
}