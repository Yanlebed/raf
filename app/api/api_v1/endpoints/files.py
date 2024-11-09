from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.api import deps
from app.utils.s3 import upload_file_to_s3
from app.models.user import User

router = APIRouter()


@router.post("/upload/")
async def upload_file(
        file: UploadFile = File(...),
        current_user: User = Depends(deps.get_current_active_user),
):
    if not file:
        raise HTTPException(status_code=400, detail="Нет файла для загрузки.")

    filename = f"users/{current_user.id}/{file.filename}"
    file_url = upload_file_to_s3(file.file, filename, file.content_type)

    if not file_url:
        raise HTTPException(status_code=500, detail="Ошибка при загрузке файла.")

    # Сохраните file_url в базе данных, если необходимо
    return {"file_url": file_url}
