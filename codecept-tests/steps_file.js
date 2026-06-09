module.exports = function () {
  return actor({
    async loginApi(email, password) {
      const res = await this.sendPostRequest('/api/auth/login', {
        email,
        password
      });

      this.seeResponseCodeIsSuccessful();

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.token ||
        res.data?.data?.accessToken;

      if (!token) {
        throw new Error('Login API không trả về token');
      }

      return token;
    },

    async setAuthToken(token) {
      this.haveRequestHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    },

    normalizeText(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    }
  });
};