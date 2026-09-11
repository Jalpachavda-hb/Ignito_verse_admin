/**
 * TESTIMONIAL SERVICE: testimonialService.js
 * Dedicated service module for Testimonial Review APIs.
 * Connects frontend components to .NET Web API AdminSetUpAPI & AdminCommonAPI endpoints.
 */

export {
  uploadTestimonialImage,
  addUpdateTestimonialReview,
  getTestimonialReviewList,
  getTestimonialReviewLists,
  fetchTestimonialReviewList,
  getTestimonialReviewById,
  deleteTestimonialReview,
  deleteTestimonial,
} from './AdminHomePageServices';

export * from '../dto/input/testimonialReviewInput';
export * from '../dto/output/testimonialReviewOutput';
