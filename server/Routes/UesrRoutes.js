const express=require('express')

const router=express.Router()

const {createUser, isLogin, login, messages,getPeople,logout}=require('../Controller/UserController')

router.post('/createuser',createUser)
router.get('/profile', isLogin)
router.post('/login', login)
router.get('/messages/:userId',messages)
router.get('/people',getPeople)
router.post('/logout',logout)

module.exports=router;