package storage

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryClient struct {
	cld    *cloudinary.Cloudinary
	folder string
}

func NewCloudinary(cloudName, apiKey, apiSecret, folder string) (*CloudinaryClient, error) {
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, fmt.Errorf("cloudinary: init: %w", err)
	}
	return &CloudinaryClient{cld: cld, folder: folder}, nil
}

type UploadResult struct {
	URL      string
	PublicID string
}

func (c *CloudinaryClient) Upload(ctx context.Context, file multipart.File, filename string) (*UploadResult, error) {
	resp, err := c.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:         c.folder,
		AllowedFormats: []string{"jpg", "jpeg", "png", "webp", "gif"},
		Transformation: "q_auto,f_auto",
	})
	if err != nil {
		return nil, fmt.Errorf("cloudinary: upload: %w", err)
	}

	return &UploadResult{
		URL:      resp.SecureURL,
		PublicID: resp.PublicID,
	}, nil
}

func (c *CloudinaryClient) Delete(ctx context.Context, publicID string) error {
	_, err := c.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	if err != nil {
		return fmt.Errorf("cloudinary: delete: %w", err)
	}
	return nil
}