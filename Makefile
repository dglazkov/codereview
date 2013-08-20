.PHONY: all deps pull-desp serve

all:
	@echo "Run 'make deps' to download dependencies."

deps:
	@git submodule init
	@git submodule update --recursive
	@echo "Done!"

pull-deps: deps
	@git submodule foreach git pull
	@echo "Done!"

serve:
	@python -m SimpleHTTPServer 9000

deploy:
	@../google_appengine/appcfg.py update .
