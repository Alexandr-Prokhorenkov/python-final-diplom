class ServiceError(Exception):
    """Ошибка бизнес-логики, которую view превращает в JSON-ответ."""

    def __init__(self, message: str, *, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
