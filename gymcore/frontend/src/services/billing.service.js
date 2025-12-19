import api from './api';

const processPayment = async (planType, paymentMethod) => {
  const response = await api.post('/billing/mock-payment', {
    plan_type: planType,
    payment_method_mock: paymentMethod
  });
  return response.data;
};

const getSubscription = async () => {
  const response = await api.get('/billing/subscription');
  return response.data;
};

export default {
  processPayment,
  getSubscription
};