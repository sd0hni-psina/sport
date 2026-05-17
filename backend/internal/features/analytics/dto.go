package analytics

type Filter struct {
	Period string `form:"period"` // week | month | year
	From   string `form:"from"`   // RFC3339, опционально
	To     string `form:"to"`     // RFC3339, опционально
}

type StatsResponse struct {
	TotalEvents       int          `json:"total_events"`
	TotalParticipants int          `json:"total_participants"`
	BySport           []SportStat  `json:"by_sport"`
	TopEvents         []EventStat  `json:"top_events"`
	ByAge             []AgeStat    `json:"by_age"`
	ByGender          []GenderStat `json:"by_gender"`
}

type SportStat struct {
	SportType string `json:"sport_type"`
	Count     int    `json:"count"`
}

type EventStat struct {
	EventID   int64  `json:"event_id"`
	EventName string `json:"event_name"`
	Count     int    `json:"count"`
}

type AgeStat struct {
	AgeGroup string `json:"age_group"`
	Count    int    `json:"count"`
}

type GenderStat struct {
	Gender string `json:"gender"`
	Count  int    `json:"count"`
}
