.PHONY: all deps serve clean

all:
	@echo "Run 'make deps' to download dependencies."

deps:
	@git submodule init
	@git submodule update --recursive
	@echo "Done!"

serve:
	@python -m SimpleHTTPServer 9000

deploy:
	@../google_appengine/appcfg.py update .
