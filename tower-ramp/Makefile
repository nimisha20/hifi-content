#
#
#

# WAVEFRONT_OBJ_TOOL=wavefront-obj-tool
WAVEFRONT_OBJ_TOOL=../../wavefront-obj-tools/wavefront-obj-tool-gauche.scm


curved-ramp-parts/%.stl: curved-ramp.scad
	mkdir -p curved-ramp-parts
	openscad -D combined=0 -D nth="`basename -s .stl $@`" -o $@ $^

%.obj: %.stl
	$(WAVEFRONT_OBJ_TOOL) -m 0.2 -n $^ -o $@

PARTS=$(foreach nth,0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23,curved-ramp-parts/${nth}.obj)

all: curved-ramp-collision-hull.obj curved-ramp.obj

# ---

curved-ramp.stl: curved-ramp.scad
	openscad -D combined=1 -o $@ $^

curved-ramp.obj: curved-ramp.stl
	$(WAVEFRONT_OBJ_TOOL) -m 0.2 -n $^ -o $@ -L curved-ramp.mtl -S ramp_mtl

curved-ramp-collision-hull.obj: $(PARTS)
	$(WAVEFRONT_OBJ_TOOL) -c -o $@ $^


# ---

clean:
	rm -rf *~ curved-ramp-parts curved-ramp-collision-hull.obj curved-ramp.obj
	rm -f curved-ramp.obj.tmp.obj curved-ramp.stl


# upload: curved-ramp.obj curved-ramp-collision-hull.obj curved-ramp.mtl tower-ramp.jpg
# 	scp $^ headache:public_html/hifi/

upload: curved-ramp.obj curved-ramp-collision-hull.obj curved-ramp.mtl tower-ramp.png
	mkdir -p curved-ramp
	cp $^ curved-ramp/
	rsync --delete -avP curved-ramp/ headache.hungry.com:public_html/hifi/curved-ramp/
