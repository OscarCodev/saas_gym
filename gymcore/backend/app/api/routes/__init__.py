from fastapi import APIRouter
from app.api.routes import auth, billing, members, dashboard, users, gyms, notifications, membership_plans

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(billing.router, prefix="/billing", tags=["billing"])
router.include_router(members.router, prefix="/members", tags=["members"])
router.include_router(membership_plans.router, prefix="/membership-plans", tags=["membership-plans"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(gyms.router, prefix="/gyms", tags=["gyms"])
router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
