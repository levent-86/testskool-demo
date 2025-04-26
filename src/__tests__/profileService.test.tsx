import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { submitProfileUpdate } from '../services/profileService';
import { ENDPOINTS } from '../constants/endpoints';
import { BaseURLS } from '../constants/base-urls';
import { AxiosError } from 'axios';

// Setup MSW server
const server = setupServer();

describe('submitProfileUpdate:', () => {
  // Reset
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('Should submit profile update successfully and return response.', async () => {
    // Mock success response
    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
        return HttpResponse.json(
          { status: 'success', message: 'Profile updated successfully.' },
          { status: 200 }
        );
      }),
    );

    // Create formData
    const formData = new FormData();
    formData.append('username', 'new-username');

    // Call function
    const response = await submitProfileUpdate(formData);

    // Now response should success
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.equal({
      status: 'success',
      message: 'Profile updated successfully.',
    });
    expect(response.config.headers['Content-Type']).to.equal('multipart/form-data');
  });

  it('should handle errors when profile update fails', async () => {
    // Mock error response
    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
        return HttpResponse.json(
          { status: 'error', message: 'Invalid data' },
          { status: 400 },
        );
      }),
    );

    // Create formData
    const formData = new FormData();
    formData.append('subject', 'invalid-subject');

    try {
      // Call function
      await submitProfileUpdate(formData);
      expect.fail('Expected request to fail');
    } catch (error) {
      // Catch error
      if (error instanceof AxiosError) {
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data).to.deep.equal({ message: 'Invalid data', status: 'error' });
      } else {
        expect.fail('Expected error to be an AxiosError');
      }
    }
  });
});
