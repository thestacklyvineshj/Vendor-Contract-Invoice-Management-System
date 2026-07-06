const bcrypt = require('bcryptjs');
const { User, Vendor } = require('../models');
const { generateToken } = require('../utils/jwt');

const register = async ({ name, email, password, role, vendorDetails, vendor_name, contact_person, phone, address }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'VENDOR';

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: userRole,
  });

  const details = vendorDetails || (userRole === 'VENDOR' ? {
    vendor_name: vendor_name || name,
    contact_person: contact_person || name,
    phone: phone || '',
    address: address || '',
  } : null);

  if (userRole === 'VENDOR' && details) {
    await Vendor.create({
      user_id: user.id,
      vendor_name: details.vendor_name || name,
      contact_person: details.contact_person || name,
      phone: details.phone || '',
      email,
      address: details.address || '',
      status: 'ACTIVE',
    });
  }

  const token = generateToken(user);
  const userData = user.toJSON();
  delete userData.password;

  return { user: userData, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  const userData = user.toJSON();
  delete userData.password;

  let vendorProfile = null;
  if (user.role === 'VENDOR') {
    vendorProfile = await Vendor.findOne({ where: { user_id: user.id } });
  }

  return { user: userData, token, vendorProfile };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  let vendorProfile = null;
  if (user.role === 'VENDOR') {
    vendorProfile = await Vendor.findOne({ where: { user_id: user.id } });
  }

  return { user, vendorProfile };
};

module.exports = { register, login, getProfile };
