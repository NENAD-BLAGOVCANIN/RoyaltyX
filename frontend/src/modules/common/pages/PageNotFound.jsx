import { ExclamationCircleFill } from "react-bootstrap-icons";

function PageNotFound() {
  return (
    <section class="py-3 py-md-5 min-vh-100 d-flex justify-content-center align-items-center">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="text-center">
              <h1 class="d-flex justify-content-center align-items-center gap-2 mb-4">
                <span class="display-1 fw-bold">4</span>
                <ExclamationCircleFill className="text-danger" />
                <span class="display-1 fw-bold bsb-flip-h">4</span>
              </h1>
              <h1 class="bold mb-2">Oops! You're lost.</h1>
              <p class="mb-5">The page you are looking for was not found.</p>
              <a
                class="btn btn-primary rounded-lg text-white px-5 fs-6 m-0"
                href="/"
                role="button"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PageNotFound;
