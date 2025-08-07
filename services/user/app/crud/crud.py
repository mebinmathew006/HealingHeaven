from sqlalchemy.future import select
from sqlalchemy import update,func
from sqlalchemy.ext.asyncio import AsyncSession
from models.users import User,PsychologistProfile,UserProfile
from schemas.users import UserCreate,UserWithOptionalProfileOut,DoctorVerificationOut,RevokeDetails
from utility.security import hash_password
from sqlalchemy.orm import joinedload,contains_eager
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import date 

async def get_user_by_email(session: AsyncSession, email: str):
    try:
        result = await session.execute(select(User).where(User.email_address == email))
        return result.scalars().first()
    except Exception as e:
        await session.rollback()
    
async def get_user_email_by_id(session: AsyncSession, user_id: int):
    try:
        result = await session.execute(select(User.email_address).where(User.id == user_id))
        return result.scalar_one_or_none()
    except Exception as e:
        await session.rollback()

async def get_user_by_id(session: AsyncSession, user_id: int):
    try:
        result = await session.execute(
            select(UserProfile).options(joinedload(UserProfile.user))
            .where(UserProfile.user_id == user_id)
        )
        return result.scalars().first()
    except Exception as e:
        await session.rollback()


async def get_user_by_id_for_profile(session: AsyncSession, user_id: int):
    try:
        result = await session.execute(
        select(User)
        .outerjoin(User.user_profile)  
        .options(contains_eager(User.user_profile))  
        .where(User.id == user_id))
        return result.scalars().first()
    except Exception :
        await session.rollback()
   
async def get_doctor_by_id_for_profile(session: AsyncSession, psychologist_id: int):
    try:
        result = await session.execute(
        select(User)
        .outerjoin(User.psychologist_profile)  
        .options(contains_eager(User.psychologist_profile))  
        .where(User.id == psychologist_id)
        )
        return result.scalars().first()
    except Exception :
        await session.rollback()
   

async def check_doctor_availability(session: AsyncSession, psychologist_id: int):
    try:
        result = await session.execute(
        select(PsychologistProfile.is_available)
        .where(PsychologistProfile.user_id == psychologist_id)
        )
        return result.scalars().first()
    except Exception :
        await session.rollback()
        return False
    

async def get_user_details_by_id(session: AsyncSession, user_id: int):
    try:
        result = await session.execute(
        select(User).where(User.id == user_id)
        )
        return result.scalars().first()
    except Exception :
        await session.rollback()
    

async def get_psycholgist_by_id(session: AsyncSession, user_id: int):
    try:
        result = await session.execute(
        select(PsychologistProfile).options(joinedload(PsychologistProfile.user))
        .where(PsychologistProfile.user_id == user_id)
        )
        return result.scalars().first()
    except Exception :
        await session.rollback()
        
    

async def create_user(session: AsyncSession, user: UserCreate):
    try:
        db_user = User(
            name=user.name,
            email_address=user.email_address,
            mobile_number=user.mobile_number,
            password=hash_password(user.password),
            role=user.role
        )
        session.add(db_user)
        await session.flush()  # Flush to get db_user.id populated

        if user.role == 'patient':
            new_profile = UserProfile(
                user_id=db_user.id,
                date_of_birth=None,
                gender=None,
                profile_image=None
            )
            session.add(new_profile)
            
        await session.commit()
        await session.refresh(db_user)  
        return db_user

    except SQLAlchemyError as e:
        await session.rollback()
        print(e, 'Database error during user creation.')
        raise HTTPException(status_code=500, detail="Database error during user creation.")
    
    


async def create_google_user(session: AsyncSession, name: str, email: str, profile_url: str, password: int):
    try:
        # Check if user already exists first (to avoid duplicate key errors)
        existing_user = await session.execute(
            select(User).where(User.email_address == email)
        )
        if existing_user.scalar_one_or_none():
            return existing_user

        db_user = User(
            name=name,
            email_address=email,
            mobile_number=None,
            password=hash_password(str(password)),
            role='patient',
            is_active=True,
            is_verified=True,
        )
        session.add(db_user)
        await session.flush()  # This will give us the user ID

        new_profile = UserProfile(
            user_id=db_user.id,
            date_of_birth=None,
            gender=None,
            profile_image=profile_url
        )
        session.add(new_profile)
        
        # Commit both operations together
        await session.commit()
        
        # Refresh to get the latest data
        await session.refresh(db_user)
        return db_user

    except IntegrityError as e:
        await session.rollback()
        print(f"Integrity error during user creation: {e}")
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    except SQLAlchemyError as e:
        await session.rollback()
        print(f"Database error during user creation: {e}")
        raise HTTPException(status_code=500, detail="Database error during user creation.")
    
    except Exception as e:
        await session.rollback()
        print(f"Unexpected error during user creation: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error during user creation.")

async def update_user_status(session: AsyncSession,email:str):
    try:
        await session.execute( update(User).where(User.email_address == email).values(is_active=~User.is_active))
        await session.commit()
    except Exception :
        await session.rollback()
   
    
async def update_user_status_email(session: AsyncSession,email:str):
    try:
        await session.execute( update(User).where(User.email_address == email).values(is_active=~User.is_active,is_verified=True))
        await session.commit()
    except Exception :
        await session.rollback()
    
    
async def toggle_user_status_by_id(session: AsyncSession,user_id:int):
    try:
        await session.execute( update(User).where(User.id == user_id).values(is_active=~User.is_active))
        await session.commit()
    except Exception :
        await session.rollback()
    
    
async def update_user_profile_image(session: AsyncSession,user_id:int,profile_url:str):
    try:
        await session.execute( update(UserProfile).where(UserProfile.user_id == user_id).values(profile_image=profile_url))
        await session.commit()
    except Exception :
        await session.rollback()
    
    
async def update_user_psychologist_image(session: AsyncSession,user_id:int,profile_url:str):
    try:
        await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(profile_image=profile_url))
        await session.commit()
    except Exception :
        await session.rollback()
    
    
async def toggle_psychologist_status_by_id(session: AsyncSession,user_id:int,status:str):
    try:
        await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_verified=status))
        await session.commit()
    except Exception :
        await session.rollback()
        
async def revoke_psychologist_status_by_id(session: AsyncSession,user_id:int,data:RevokeDetails):
    try:
        await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_verified=data.status,reason_block=data.reason))
        await session.commit()
    except Exception :
        await session.rollback()
    
    
async def psychologist_availability_update(session: AsyncSession,user_id:int,isAvailable:bool):
    try:
        user =await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_available=isAvailable).returning(PsychologistProfile.is_available))
        await session.commit()
        new_value = user.scalar_one()
        return new_value
    except SQLAlchemyError as e:
        await session.rollback()
        
async def update_psychologist_documents_crud(session: AsyncSession,user_id:int,url:str,doc_type):
    try:
        if doc_type=='edu_url': 
            await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(education_certificate=url))
        elif doc_type =='id_url':
            await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(identification_doc=url))
        elif doc_type =='exp_url':
            await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(experience_certificate=url))
        
        await session.commit()
    except SQLAlchemyError as e:
        await session.rollback()
    
async def update_user_password(session: AsyncSession,email:str,password :str):
    try:
        await session.execute( update(User).where(User.email_address == email).values(password=hash_password(password)))
        await session.commit()
    except Exception :
        await session.rollback()
    
    
async def get_all_psychologist_with_profile(session: AsyncSession, limit: int = 8, skip: int = 0):
    try:
        result = await session.execute(
            select(PsychologistProfile)
            .join(PsychologistProfile.user)  
            .options(joinedload(PsychologistProfile.user))
            .where(
                PsychologistProfile.is_verified == 'verified',
                User.is_active == True
            )
            .order_by(PsychologistProfile.is_available.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    except SQLAlchemyError as e:
        await session.rollback()
        raise e 
    
async def count_all_psychologists(session: AsyncSession) -> int:
    result = await session.execute(
        select(func.count())
        .select_from(PsychologistProfile)
        .join(PsychologistProfile.user)
        .where(
            PsychologistProfile.is_verified == 'verified',
            User.is_active == True
        )
    )
    return result.scalar_one()

async def update_user_and_profile(
    session: AsyncSession, 
    user_id: int, 
    update_data: UserWithOptionalProfileOut
    ):
    try:
        
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
    except Exception :
        await session.rollback()
        

async def update_psychologist_and_profile(
    session: AsyncSession, 
    user_id: int, 
    update_data: DoctorVerificationOut
    ):
    try:
        user = await session.get(User, user_id)
        if not user:
            return None

        # Update basic user fields
        user.name = update_data.user.name
        user.mobile_number = update_data.user.mobile_number

        # Fetch the profile
        result = await session.execute(
            select(PsychologistProfile)
            .where(PsychologistProfile.user_id == user_id))
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
    except Exception :
        await session.rollback()
    
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
        
async def doctor_profile_update(
    session: AsyncSession,
    user_id: int,
    date_of_birth: date,
    experience: str,
    gender: str,
    fees: str,
    qualification: str,
    specialization: str,
    about_me: str,
    id_url: str,
    edu_url: str,
    exp_url: str
):
    try:
        result = await session.execute(select(PsychologistProfile).where(PsychologistProfile.user_id == user_id))
        profile = result.scalar_one_or_none()
        if profile:
            
            profile.date_of_birth=date_of_birth
            profile.experience=experience
            profile.gender=gender
            profile.fees=fees
            profile.qualification=qualification
            profile.specialization=specialization
            profile.about_me=about_me
            profile.reason_block=''
            profile.is_verified='pending'
            if id_url:
                profile.identification_doc=id_url
            if edu_url:
                profile.education_certificate=edu_url
            if exp_url:
                profile.experience_certificate=exp_url
                
                
        await session.flush()
        await session.commit()
        return profile

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
        await session.rollback()
        
async def doctor_profile_images_crud(session: AsyncSession):
    try:
        result = await session.execute(select(PsychologistProfile.profile_image).limit(9))
        return result.scalars().all()
    except SQLAlchemyError as e:
        await session.rollback()
        return []
        
    
async def get_all_psychologist(session: AsyncSession):
    try:
        result = await session.execute( select(User).where(User.role == 'doctor'))
        return result.scalars().all()
    except SQLAlchemyError as e:
        await session.rollback()
        print(f"Database error occurred: {e}")
    