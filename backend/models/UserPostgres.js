const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'username',
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email',
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'full_name'
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone_number'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status',
    defaultValue: 'active'
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'email_verified',
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'phone_verified',
    defaultValue: false
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'failed_login_attempts',
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locked_until'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    field: 'role'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'isActive'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'lastLogin'
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      theme: 'auto',
      resultsPerPage: 10
    },
    field: 'preferences'
  }
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(12);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// 实例方法：比较密码
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// 实例方法：转换为JSON时移除密码
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

// 静态方法：获取用户统计信息
User.getStats = async function() {
  const result = await User.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"isActive\" = true THEN 1 ELSE 0 END")), 'activeUsers'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN role = 'admin' THEN 1 ELSE 0 END")), 'adminUsers']
    ],
    raw: true
  });

  return result[0] || {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0
  };
};

module.exports = User;