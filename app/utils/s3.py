import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from app.core.config import settings
from typing import Optional

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION_NAME,
    endpoint_url=settings.AWS_S3_ENDPOINT_URL  # Если используете совместимый сервис
)


def upload_file_to_s3(file_obj, filename: str, content_type: str) -> Optional[str]:
    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.AWS_STORAGE_BUCKET_NAME,
            filename,
            ExtraArgs={
                "ContentType": content_type,
                "ACL": "public-read"  # Настройте права доступа по необходимости
            }
        )
        file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{filename}"
        return file_url
    except (NoCredentialsError, ClientError) as e:
        print(f"Ошибка при загрузке файла: {e}")
        return None


def create_presigned_put_url(key: str, content_type: str, expires_in: int = 3600) -> Optional[str]:
    try:
        return s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': key,
                'ContentType': content_type,
                'ACL': 'public-read',
            },
            ExpiresIn=expires_in
        )
    except ClientError as e:
        print(f"Ошибка при генерации presigned URL: {e}")
        return None
