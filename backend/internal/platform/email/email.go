package email

import (
	"fmt"
	"log"

	"github.com/resend/resend-go/v2"
)

type Client struct {
	client *resend.Client
	from   string
}

func New(apiKey, from string) *Client {
	return &Client{
		client: resend.NewClient(apiKey),
		from:   from,
	}
}

func (c *Client) SendVerificationCode(to, code string) error {
	html := fmt.Sprintf(`
		<div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
			<div style="background: #0D1F3C; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
				<h1 style="color: white; font-size: 24px; margin: 0 0 8px;">Атырау Спорт</h1>
				<p style="color: #7A8FA8; margin: 0; font-size: 14px;">Акимат города Атырау</p>
			</div>

			<h2 style="color: #0D1F3C; font-size: 20px; margin: 0 0 8px;">Код подтверждения</h2>
			<p style="color: #64748B; font-size: 14px; margin: 0 0 24px;">
				Введите этот код для входа в аккаунт. Код действителен 5 минут.
			</p>

			<div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
				<span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0D1F3C;">%s</span>
			</div>

			<p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0;">
				Если вы не запрашивали этот код — просто проигнорируйте письмо.
			</p>
		</div>
	`, code)

	params := &resend.SendEmailRequest{
		From:    c.from,
		To:      []string{to},
		Subject: fmt.Sprintf("%s — код подтверждения", code),
		Html:    html,
	}

	_, err := c.client.Emails.Send(params)
	if err != nil {
		log.Printf("SENDING EMAIL TO: %s", to)
		log.Printf("FROM: %s", c.from)
		log.Printf("CODE: %s", code)
		log.Printf("RESEND ERROR: %+v", err)
		return fmt.Errorf("email send failed: %w", err)
	}
	return nil
}
