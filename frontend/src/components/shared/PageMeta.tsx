import { Helmet } from 'react-helmet-async'

interface Props {
  title: string
  description?: string
}

const SITE_NAME = 'Атырау Спорт'

export function PageMeta({ title, description }: Props) {
  return (
    <Helmet>
      <title>{title} — {SITE_NAME}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  )
}