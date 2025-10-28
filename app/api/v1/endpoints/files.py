from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.utils.s3 import upload_file_to_s3, create_presigned_put_url
from app.models.user import User, UserType
from app.models.user_organization import UserOrganization
from app.core.enums import OrganizationRole

router = APIRouter()


@router.post("/upload/")
async def upload_file(
        file: UploadFile = File(...),
        current_user: User = Depends(deps.get_current_active_user),
        db: AsyncSession = Depends(deps.get_db),
        org_id: Optional[int] = None,
):
    if not file:
        raise HTTPException(status_code=400, detail="Нет файла для загрузки.")

    # Determine storage path based on org ownership
    if org_id is not None:
        if current_user.user_type != UserType.ADMIN:
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
                )
            )
            if not result.scalars().first():
                raise HTTPException(status_code=403, detail="Недостаточно прав для загрузки в пространство организации.")
        prefix = f"orgs/{org_id}"
    else:
        prefix = f"users/{current_user.id}"

    filename = f"{prefix}/{file.filename}"
    file_url = upload_file_to_s3(file.file, filename, file.content_type)

    if not file_url:
        raise HTTPException(status_code=500, detail="Ошибка при загрузке файла.")

    # Сохраните file_url в базе данных, если необходимо
    return {"file_url": file_url}


@router.post("/presign")
async def presign_upload(
        *,
        filename: str,
        content_type: str,
        current_user: User = Depends(deps.get_current_active_user),
        db: AsyncSession = Depends(deps.get_db),
        org_id: Optional[int] = None,
):
    if org_id is not None:
        if current_user.user_type != UserType.ADMIN:
            result = await db.execute(
                select(UserOrganization).where(
                    UserOrganization.user_id == current_user.id,
                    UserOrganization.organization_id == org_id,
                    UserOrganization.role.in_([OrganizationRole.OWNER, OrganizationRole.MANAGER])
                )
            )
            if not result.scalars().first():
                raise HTTPException(status_code=403, detail="Недостаточно прав для загрузки в пространство организации.")
        key = f"orgs/{org_id}/{filename}"
    else:
        key = f"users/{current_user.id}/{filename}"
    url = create_presigned_put_url(key, content_type)
    if not url:
        raise HTTPException(status_code=500, detail="Не удалось создать presigned URL")
    return {"upload_url": url, "key": key}
