(define-library (rocks-main)
  (export main-program)
  (import (scheme base)
          (scheme file)
          (scheme inexact)
          (scheme process-context)
          (srfi 27)
          (foldling command-line)
          (seth cout)
          (seth model-3d)
          (seth math-3d)
          (seth obj-model))
  (begin

    (define (create-points-for-cube model point-count size)
      (let* ((reso 5.0)
             (rand-max (exact (* size reso)))
             (half-rand-max (/ rand-max 2.0)))
        (let loop ((i 0))
          (cond ((= i point-count) #t)
                (else
                 (let* ((point-3d (vector (inexact (- (random-integer rand-max) half-rand-max))
                                          (inexact (- (random-integer rand-max) half-rand-max))
                                          (inexact (- (random-integer rand-max) half-rand-max))))
                        (point-3d-str (vector-map number->string (vector3-scale point-3d (/ 1.0 reso)))))
                   (model-append-vertex! model point-3d-str)
                   (loop (+ i 1))))))))


    (define (create-points-for-sphere model point-count size)
      (let* ((reso 5.0)
             (rand-max (exact (* size reso))))
        (let loop ((i 0))
          (cond ((= i point-count) #t)
                (else
                 (let* ((radius (/ (random-integer rand-max) reso))
                        (theta (* (/ (random-integer 100) 100.0) pi))
                        (phi (* (/ (random-integer 100) 100.0) pi*2))
                        (point-3d (polar-coordinates->cartesian radius theta phi))
                        (point-3d-str (vector-map number->string (vector3-scale point-3d (/ 1.0 reso)))))
                   (model-append-vertex! model point-3d-str)
                   (loop (+ i 1))))))))


    (define (create-points-for-crystal model point-count size)
      (let ((top-point (vector 0 (/ size 2.0) 0))
            (bottom-point (vector 0 (/ size -2.0) 0))
            (upper-ring-y (* size 0.30))
            (upper-radius (* size 0.18))
            (lower-ring-y (* size -0.4))
            (lower-radius (* size 0.10))
            (a (/ pi*2 point-count)))

        (model-append-vertex! model (vector-map number->string top-point))
        (model-append-vertex! model (vector-map number->string bottom-point))
        (let loop ((i 0))
          (cond ((= i point-count) #t)
                (else
                 (let* ((x (* (cos (* a i)) upper-radius))
                        (z (* (sin (* a i)) upper-radius))
                        (p (vector x upper-ring-y z)))
                   (model-append-vertex! model (vector-map number->string p))
                   (loop (+ i 1))))))
        (let loop ((i 0))
          (cond ((= i point-count) #t)
                (else
                 (let* ((x (* (cos (* a i)) lower-radius))
                        (z (* (sin (* a i)) lower-radius))
                        (p (vector x lower-ring-y z)))
                   (model-append-vertex! model (vector-map number->string p))
                   (loop (+ i 1))))))))


    (define (main-program)
      (define (usage why)
        (cerr why "\n")
        (cerr "rocks [arguments] obj-output-file\n")
        (cerr "  --random-i              pseudo-random number generator seed\n")
        (cerr "  --random-j              pseudo-random number generator seed\n")
        (cerr "  --size                  maximum dimension of output\n")
        (cerr "  --cube                  distribute points in a cube shape (default)\n")
        (cerr "  --sphere                distribute points in a sphere shape\n")
        (cerr "  --crystal               make a crystal shape\n")
        (exit 1))

      (let* ((args (parse-command-line `((-?) (-h)
                                         ((--cube --sphere --crystal))
                                         (--random-i random-i)
                                         (--random-j random-j)
                                         (--size size))))
             (output-filename #f)
             (point-count #f)
             (random-i #f)
             (random-j #f)
             (size #f)
             (shape-cube #f)
             (shape-sphere #f)
             (shape-crystal #f)
             (extra-arguments '()))
        (for-each
         (lambda (arg)
           (case (car arg)
             ((-? -h) (usage ""))
             ((--random-i)
              (set! random-i (string->number (cadr arg))))
             ((--random-j)
              (set! random-j (string->number (cadr arg))))
             ((--size)
              (set! size (string->number (cadr arg))))
             ((--cube)
              (if (or shape-cube shape-sphere shape-crystal)
                  (usage "give --cube or --sphere or --crystal only once"))
              (set! shape-cube #t))
             ((--sphere)
              (if (or shape-cube shape-sphere shape-crystal)
                  (usage "give --cube or --sphere or --crystal only once"))
              (set! shape-sphere #t))
             ((--crystal)
              (if (or shape-cube shape-sphere shape-crystal)
                  (usage "give --cube or --sphere or --crystal only once"))
              (set! shape-crystal #t))
             ((--)
              (set! extra-arguments (cdr arg)))))
         args)

        (if (not random-i) (set! random-i 0))
        (if (not random-j) (set! random-j 0))
        (if (not size) (set! size 10))
        (if (not (or shape-cube shape-sphere shape-crystal)) (set! shape-cube #t))

        (if (not (= (length extra-arguments) 2))
            (usage "give obj output-filename and point-count"))
        (set! output-filename (car extra-arguments))
        (set! point-count (exact (string->number (cadr extra-arguments))))

        (let* ((model (make-empty-model))
               (mesh (make-mesh #f '()))
               (random-source (make-random-source))
               (random-integer (random-source-make-integers random-source))
               (output-handle
                (if (equal? output-filename "-")
                    (current-output-port)
                    (open-output-file output-filename))))
          (random-source-pseudo-randomize! random-source random-i random-j)
          (model-prepend-mesh! model mesh)

          (cond (shape-cube (create-points-for-cube model point-count size))
                (shape-sphere (create-points-for-sphere model point-count size))
                (shape-crystal (create-points-for-crystal model point-count size)))

          (write-obj-model (model->convex-hull model) output-handle)
          (if (not (equal? output-filename "-"))
              (close-output-port output-handle)))))))
