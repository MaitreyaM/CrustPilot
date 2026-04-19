.PHONY: backend frontend backend-env

CONDA_ENV=crustpilot-backend

backend-env:
	cd backend && conda env create -f environment.yml || conda env update -f environment.yml --prune

backend:
	cd backend && conda run -n $(CONDA_ENV) uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev
