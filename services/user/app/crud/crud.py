from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from models.users import User,PsychologistProfile,UserProfile
from schemas.users import UserCreate,UserWithOptionalProfileOut,DoctorVerificationOut
from utility.security import hash_password
from sqlalchemy.orm import joinedload,contains_eager
from sqlalchemy.exc import SQLAlchemyError

async def get_user_by_email(session: AsyncSession, email: str):
    result = await session.execute(select(User).where(User.email_address == email))
    return result.scalars().first()

async def get_user_by_id(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(UserProfile).options(joinedload(UserProfile.user))
        .where(UserProfile.user_id == user_id)
    )
    return result.scalars().first()

async def get_user_by_id_for_profile(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(User)
        .outerjoin(User.user_profile)  
        .options(contains_eager(User.user_profile))  
        .where(User.id == user_id)
    )
    return result.scalars().first()

async def get_doctor_by_id_for_profile(session: AsyncSession, psychologist_id: int):
    result = await session.execute(
        select(User)
        .outerjoin(User.psychologist_profile)  
        .options(contains_eager(User.psychologist_profile))  
        .where(User.id == psychologist_id)
    )
    return result.scalars().first()

async def get_user_details_by_id(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalars().first()

async def get_psycholgist_by_id(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(PsychologistProfile).options(joinedload(PsychologistProfile.user))
        .where(PsychologistProfile.user_id == user_id)
    )
    return result.scalars().first()


async def create_user(session: AsyncSession, user: UserCreate):
    db_user = User(
        name=user.name,
        email_address=user.email_address,
        mobile_number=user.mobile_number,
        password=hash_password(user.password),  # Ideally hashed!
        role=user.role,
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def update_user_status(session: AsyncSession,email:str):
    await session.execute( update(User).where(User.email_address == email).values(is_active=~User.is_active))
    await session.commit()
    
async def update_user_status_email(session: AsyncSession,email:str):
    await session.execute( update(User).where(User.email_address == email).values(is_active=~User.is_active,is_verified=True))
    await session.commit()
    
async def toggle_user_status_by_id(session: AsyncSession,user_id:int):
    await session.execute( update(User).where(User.id == user_id).values(is_active=~User.is_active))
    await session.commit()
    
async def update_user_profile_image(session: AsyncSession,user_id:int,profile_url:str):
    await session.execute( update(UserProfile).where(UserProfile.user_id == user_id).values(profile_image=profile_url))
    await session.commit()
    
async def update_user_psychologist_image(session: AsyncSession,user_id:int,profile_url:str):
    await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(profile_image=profile_url))
    await session.commit()
    
async def toggle_psychologist_status_by_id(session: AsyncSession,user_id:int):
    await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_verified=~PsychologistProfile.is_verified))
    await session.commit()
    
async def psychologist_availability_update(session: AsyncSession,user_id:int,isAvailable:bool):
    try:
        user =await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_available=isAvailable).returning(PsychologistProfile.is_available))
        await session.commit()
        new_value = user.scalar_one()
        return new_value
    except SQLAlchemyError as e:
        await session.rollback()
    
async def update_user_password(session: AsyncSession,email:str,password :str):
    await session.execute( update(User).where(User.email_address == email).values(password=hash_password(password)))
    await session.commit()
    
async def get_all_psychologist_with_profile(session:AsyncSession):
    result = await session.execute(select(PsychologistProfile).options(joinedload(PsychologistProfile.user))
                                   .where(PsychologistProfile.is_verified == True).order_by(PsychologistProfile.is_available.desc()) )
    return result.scalars().all()

async def update_user_and_profile(session: AsyncSession, user_id: int, update_data: UserWithOptionalProfileOut):
    user = await session.get(User, user_id)
    if not user:
        return None

    # Update basic user fields
    user.name = update_data.name
    user.mobile_number = update_data.mobile_number

    # Fetch the profile
    result = await session.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()

    if profile:
        # Update existing profile
        profile.date_of_birth = update_data.user_profile.date_of_birth
        profile.gender = update_data.user_profile.gender
        profile.profile_image = update_data.user_profile.profile_image
    else:
        # Create new profile if not exists
        new_profile = UserProfile(
            user_id=user_id,
            date_of_birth=update_data.user_profile.date_of_birth,
            gender=update_data.user_profile.gender,
            profile_image=update_data.user_profile.profile_image
        )
        session.add(new_profile)

    await session.commit()
    return user


async def update_psychologist_and_profile(session: AsyncSession, user_id: int, update_data: DoctorVerificationOut):
    user = await session.get(User, user_id)
    if not user:
        return None

    # Update basic user fields
    user.name = update_data.user.name
    user.mobile_number = update_data.user.mobile_number

    # Fetch the profile
    result = await session.execute(select(PsychologistProfile).where(PsychologistProfile.user_id == user_id))
    profile = result.scalar_one_or_none()

    if profile:
        # Update existing profile
        profile.date_of_birth = update_data.date_of_birth
        profile.gender = update_data.gender
        profile.about_me = update_data.about_me
        profile.qualification = update_data.qualification
        profile.experience = update_data.experience
        profile.specialization = update_data.specialization
        profile.fees = update_data.fees
    
    await session.commit()
    return user


async def doctor_profile_creation(
    session: AsyncSession,
    user_id: int,
    dateOfBirth: str,
    experience: str,
    gender: str,
    fees: str,
    qualification: str,
    specialization: str,
    aboutMe: str,
    id_url: str,
    edu_url: str,
    exp_url: str
):
    try:
        verification = PsychologistProfile(
            user_id=user_id,
            date_of_birth=dateOfBirth,
            experience=experience,
            gender=gender,
            fees=fees,
            qualification=qualification,
            specialization=specialization,
            about_me=aboutMe,
            identification_doc=id_url,
            education_certificate=edu_url,
            experience_certificate=exp_url,
        )

        session.add(verification)
        await session.commit()
        await session.refresh(verification)
        return verification

    except SQLAlchemyError as e:
        await session.rollback()
        # Log or raise error
        print(f"Database error occurred: {e}")
        
    
    
async def get_all_users(session: AsyncSession):
    try:
        # result = await session.execute( select(UserProfile).join(User).options(joinedload(UserProfile.user)).where(User.role == 'patient'))
        result = await session.execute( select(User).where(User.role == 'patient'))
        return result.scalars().all()
    except SQLAlchemyError as e:
        print(f"Database error occurred: {e}")
    
async def get_all_psychologist(session: AsyncSession):
    try:
        result = await session.execute( select(User).where(User.role == 'doctor'))
        return result.scalars().all()
    except SQLAlchemyError as e:
        print(f"Database error occurred: {e}")
    