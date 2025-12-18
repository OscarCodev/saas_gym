from sqlalchemy.orm import Session
from typing import List
from app.domain.entities import Member
from app.infrastructure.repositories import MemberRepository

class CreateMemberUseCase:
    def __init__(self, db: Session):
        self.member_repo = MemberRepository(db)

    def execute(self, member: Member) -> Member:
        return self.member_repo.create(member)

class UpdateMemberUseCase:
    def __init__(self, db: Session):
        self.member_repo = MemberRepository(db)

    def execute(self, member_id: int, gym_id: int, member_data: dict):
        return self.member_repo.update(member_id, gym_id, member_data)

class DeleteMemberUseCase:
    def __init__(self, db: Session):
        self.member_repo = MemberRepository(db)

    def execute(self, member_id: int, gym_id: int):
        return self.member_repo.delete(member_id, gym_id)

class GetMembersUseCase:
    def __init__(self, db: Session):
        self.member_repo = MemberRepository(db)

    def execute(self, gym_id: int) -> List[Member]:
        return self.member_repo.get_all_by_gym(gym_id)
