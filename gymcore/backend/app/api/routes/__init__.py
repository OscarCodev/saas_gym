from fastapi import APIRouter
from app.api.routes import auth, billing, members, dashboard

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(billing.router, prefix="/billing", tags=["billing"])
router.include_router(members.router, prefix="/members", tags=["members"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
