from .base_controller import Controller
from app.services.model_services import ModelServices

class ModelSelectionController(Controller):
    
    def __init__(self):
        super().__init__()
        self.model_selection_service = ModelServices()

    def get_models_status(self, path):

        # Check if string is empty
        if not path:
            return Exception("No path specified")

        result = self.model_selection_service.check_available_models(path)

        return result
    
    # def download_new_model(self, path, model_name):
    #     pass

    # def remove_model_from_disk(self, path, model_):
    #     pass

    

    