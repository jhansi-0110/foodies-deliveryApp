import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="card border rounded-3 p-4 p-md-5">
              <h3 className="fw-bold text-dark text-center mb-1">Get in Touch</h3>
              <p className="text-muted text-center small mb-4">Have questions or feedback? We'd love to hear from you.</p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">First Name</label>
                    <input type="text" className="form-control" placeholder="John" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Last Name</label>
                    <input type="text" className="form-control" placeholder="Doe" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">Email Address</label>
                    <input type="email" className="form-control" placeholder="john@example.com" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">Message</label>
                    <textarea className="form-control" rows="4" placeholder="How can we help?" required></textarea>
                  </div>
                  <div className="col-12 pt-2">
                    <button className="btn btn-dark w-100 py-2.5 fw-medium" type="submit">
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;