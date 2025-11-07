const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mkt9834:vhffkvhffkvhffk@naraddon-cluster.cicap0i.mongodb.net/naraddon?retryWrites=true&w=majority&appName=naraddon-cluster'

// User Schema
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'work_users' }
)

const User = mongoose.models.WorkUser || mongoose.model('WorkUser', UserSchema)

async function createTestUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB 연결 성공')

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('test1234', 10)

    // 테스트 계정 생성
    const testUser = await User.create({
      email: 'test@naraddon.com',
      name: '테스트 관리자',
      password: hashedPassword,
      role: 'admin',
      isApproved: true, // 승인된 상태
    })

    console.log('\n✅ 테스트 계정 생성 완료!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 이메일: test@naraddon.com')
    console.log('🔑 비밀번호: test1234')
    console.log('👤 이름:', testUser.name)
    console.log('⚡ 역할:', testUser.role)
    console.log('✓ 승인 상태:', testUser.isApproved ? '승인됨' : '대기중')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    await mongoose.disconnect()
    console.log('✅ MongoDB 연결 종료')
  } catch (error) {
    if (error.code === 11000) {
      console.error('❌ 이미 존재하는 이메일입니다.')
      console.log('\n기존 계정 정보:')
      console.log('📧 이메일: test@naraddon.com')
      console.log('🔑 비밀번호: test1234')
    } else {
      console.error('❌ 오류 발생:', error.message)
    }
    await mongoose.disconnect()
    process.exit(1)
  }
}

createTestUser()
