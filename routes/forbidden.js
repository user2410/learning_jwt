const {Router} = require('express');
const {requireAuth} = require('../middleware/authMiddleware');

const router = Router();

router.get('/', requireAuth, (req, res)=>{
    // revoke current token
    req.cookies.jwt
    res.redirect('/');
});

module.exports = router;