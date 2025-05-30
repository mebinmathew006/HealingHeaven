from services.user.app.models.users import Base

def check_models():
    # This will print all mapped tables that SQLAlchemy is aware of
    print("Detected tables in metadata:")
    for table in Base.metadata.tables:
        print(f" - {table}")
    
    if not Base.metadata.tables:
        print("ERROR: No tables found in metadata!")
        print("Check that your models are properly defined and imported.")

if __name__ == "__main__":
    check_models()