jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  return {
    __esModule: true,
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      open: jest.fn(),
    },
  };
});
