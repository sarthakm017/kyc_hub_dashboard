 jest.mock('antd', () => {
    const actual = jest.requireActual('antd');
    return {
      __esModule: true,
      ...actual,
      // stub only the message API
      message: {
        success: jest.fn(),
        error:   jest.fn(),
        info:    jest.fn(),
        warning: jest.fn(),
        open:    jest.fn(),
      }
    };
  });
  