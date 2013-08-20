.PHONY: all deps serve clean

all:
	@echo "Run 'make deps' to download dependencies."

deps:
	cd third_party && git submodules update
	@echo "Done!"

serve:
	@python -m SimpleHTTPServer 9000

deploy:
	@../google_appengine/appcfg.py update .
