from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.payment import *
from sqlalchemy.orm import joinedload,selectinload
from sqlalchemy.exc import SQLAlchemyError
from models.payment import Wallet,WalletTransaction


async def get_wallet_details_with_transactions_by_id(session: AsyncSession, user_id: int):
    result = await session.execute(
    select(Wallet)
    .options(selectinload(Wallet.wallet_transactions))  # non-joined eager load
    .where(Wallet.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def money_to_wallet(session: AsyncSession, user_id: int, amount: float):
    # Fetch the wallet for the user
    result = await session.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = result.scalar_one_or_none()

    # If wallet doesn't exist, create it
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0)
        session.add(wallet)
        await session.flush()  # To get wallet.id before using it

    # Update balance
    wallet.balance += amount

    # Create wallet transaction
    wallet_trans = WalletTransaction(
        wallet_id=wallet.id,
        transaction_amount=amount,
    )
    session.add(wallet_trans)

    # Commit both changes
    await session.commit()
    
async def get_wallet_balance_by_id(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(Wallet).where(Wallet.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    return wallet

# async def get_user_by_email(session: AsyncSession, email: str):
#     result = await session.execute(select(User).where(User.email_address == email))
#     return result.scalars().first()

# async def get_user_by_id(session: AsyncSession, user_id: int):
#     result = await session.execute(
#         select(UserProfile).options(joinedload(UserProfile.user))
#         .where(UserProfile.user_id == user_id)
#     )
#     return result.scalars().first()



# async def get_psycholgist_by_id(session: AsyncSession, user_id: int):
#     result = await session.execute(
#         select(PsychologistProfile).options(joinedload(PsychologistProfile.user))
#         .where(PsychologistProfile.user_id == user_id)
#     )
#     return result.scalars().first()




# async def update_user_status(session: AsyncSession,email:str):
#     await session.execute( update(User).where(User.email_address == email).values(is_active=~User.is_active))
#     await session.commit()
    
# async def update_user_status_email(session: AsyncSession,email:str):
#     await session.execute( update(User).where(User.email_address == email).values(is_active=~User.is_active,is_verified=True))
#     await session.commit()
    
# async def toggle_user_status_by_id(session: AsyncSession,user_id:int):
#     await session.execute( update(User).where(User.id == user_id).values(is_active=~User.is_active))
#     await session.commit()
    
# async def update_user_profile_image(session: AsyncSession,user_id:int,profile_url:str):
#     await session.execute( update(UserProfile).where(UserProfile.user_id == user_id).values(profile_image=profile_url))
#     await session.commit()
    
# async def update_user_psychologist_image(session: AsyncSession,user_id:int,profile_url:str):
#     await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(profile_image=profile_url))
#     await session.commit()
    
# async def toggle_psychologist_status_by_id(session: AsyncSession,user_id:int):
#     await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_verified=~PsychologistProfile.is_verified))
#     await session.commit()
    
# async def psychologist_availability_update(session: AsyncSession,user_id:int):
#     try:
#         user =await session.execute( update(PsychologistProfile).where(PsychologistProfile.user_id == user_id).values(is_available=~PsychologistProfile.is_available).returning(PsychologistProfile.is_available))
#         await session.commit()
#         new_value = user.scalar_one()
#         return new_value
#     except SQLAlchemyError as e:
#         await session.rollback()
    
# async def update_user_password(session: AsyncSession,email:str,password :str):
#     await session.execute( update(User).where(User.email_address == email).values(password=hash_password(password)))
#     await session.commit()
    
# async def get_all_psychologist_with_profile(session:AsyncSession):
#     result = await session.execute(select(PsychologistProfile).options(joinedload(PsychologistProfile.user))
#                                    .where(PsychologistProfile.is_verified == True).order_by(PsychologistProfile.is_available.desc()) )
#     return result.scalars().all()

# async def update_user_and_profile(session: AsyncSession, user_id: int, update_data: UserWithOptionalProfileOut):
#     user = await session.get(User, user_id)
#     if not user:
#         return None

#     # Update basic user fields
#     user.name = update_data.name
#     user.mobile_number = update_data.mobile_number

#     # Fetch the profile
#     result = await session.execute(select(UserProfile).where(UserProfile.user_id == user_id))
#     profile = result.scalar_one_or_none()

#     if profile:
#         # Update existing profile
#         profile.date_of_birth = update_data.user_profile.date_of_birth
#         profile.gender = update_data.user_profile.gender
#         profile.profile_image = update_data.user_profile.profile_image
#     else:
#         # Create new profile if not exists
#         new_profile = UserProfile(
#             user_id=user_id,
#             date_of_birth=update_data.user_profile.date_of_birth,
#             gender=update_data.user_profile.gender,
#             profile_image=update_data.user_profile.profile_image
#         )
#         session.add(new_profile)

#     await session.commit()
#     return user


# async def update_psychologist_and_profile(session: AsyncSession, user_id: int, update_data: DoctorVerificationOut):
#     user = await session.get(User, user_id)
#     if not user:
#         return None

#     # Update basic user fields
#     user.name = update_data.user.name
#     user.mobile_number = update_data.user.mobile_number

#     # Fetch the profile
#     result = await session.execute(select(PsychologistProfile).where(PsychologistProfile.user_id == user_id))
#     profile = result.scalar_one_or_none()

#     if profile:
#         # Update existing profile
#         profile.date_of_birth = update_data.date_of_birth
#         profile.gender = update_data.gender
#         profile.about_me = update_data.about_me
#         profile.qualification = update_data.qualification
#         profile.experience = update_data.experience
#         profile.specialization = update_data.specialization
#         profile.fees = update_data.fees
    
#     await session.commit()
#     return user


# async def doctor_profile_creation(
#     session: AsyncSession,
#     user_id: int,
#     dateOfBirth: str,
#     experience: str,
#     gender: str,
#     fees: str,
#     qualification: str,
#     specialization: str,
#     aboutMe: str,
#     id_url: str,
#     edu_url: str,
#     exp_url: str
# ):
#     try:
#         verification = PsychologistProfile(
#             user_id=user_id,
#             date_of_birth=dateOfBirth,
#             experience=experience,
#             gender=gender,
#             fees=fees,
#             qualification=qualification,
#             specialization=specialization,
#             about_me=aboutMe,
#             identification_doc=id_url,
#             education_certificate=edu_url,
#             experience_certificate=exp_url,
#         )

#         session.add(verification)
#         await session.commit()
#         await session.refresh(verification)
#         return verification

#     except SQLAlchemyError as e:
#         await session.rollback()
#         # Log or raise error
#         print(f"Database error occurred: {e}")
        
    
    
# async def get_all_users(session: AsyncSession):
#     try:
#         # result = await session.execute( select(UserProfile).join(User).options(joinedload(UserProfile.user)).where(User.role == 'patient'))
#         result = await session.execute( select(User).where(User.role == 'patient'))
#         return result.scalars().all()
#     except SQLAlchemyError as e:
#         print(f"Database error occurred: {e}")
    
# async def get_all_psychologist(session: AsyncSession):
#     try:
#         result = await session.execute( select(User).where(User.role == 'doctor'))
#         return result.scalars().all()
#     except SQLAlchemyError as e:
#         print(f"Database error occurred: {e}")
    