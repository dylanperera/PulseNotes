from .base_controller import Controller
from ..services.model_selection_service import ModelSelectionService

class ModelSelectionController(Controller):
    
    def __init__(self):
        super().__init__()
        self.model_selection_service = ModelSelectionService()

    def get_models_status(self, path):

        result = self.model_selection_service.check_available_models(path)

        return result
    
    # def download_new_model(self, path, model_name):
    #     pass

    # def remove_model_from_disk(self, path, model_):
    #     pass

    

    