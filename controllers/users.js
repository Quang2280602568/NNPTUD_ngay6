let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')
module.exports = {
    CreateAnUser: async function (
        username, password, email, role, fullname, avatarUrl, status, loginCount) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullname,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newUser.save();
        return newUser;
    },
    FindUserByUsername: async function (username) {
        return await userModel.findOne({
            username: username,
            isDeleted: false
        })
    },
    FindUserById: async function (id) {
        try {
            return await userModel.findOne({
                _id: id,
                isDeleted: false
            })
        } catch (error) {
            return false
        }
    },
    ChangePassword: async function (userId, oldPassword, newPassword) {
        try {
            let user = await userModel.findOne({
                _id: userId,
                isDeleted: false
            })
            if (!user) {
                return { success: false, message: "người dùng không tồn tại" }
            }
            // Kiểm tra mật khẩu cũ
            if (!bcrypt.compareSync(oldPassword, user.password)) {
                return { success: false, message: "mật khẩu cũ không chính xác" }
            }
            // Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
            if (oldPassword === newPassword) {
                return { success: false, message: "mật khẩu mới không được trùng mật khẩu cũ" }
            }
            // Cập nhật mật khẩu mới
            user.password = newPassword
            await user.save()
            return { success: true, message: "đổi mật khẩu thành công" }
        } catch (error) {
            return { success: false, message: "lỗi khi đổi mật khẩu", error: error.message }
        }
    }
}