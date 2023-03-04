import { Request, Response } from 'express'
import User from '../models/user.model'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../config'

const createUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body)
    //check if user is already exists
    const ChkUser = await User.findOne({ email: req.body.email }).exec()

    if (ChkUser) return res.status(400).json('user already exists')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    user.password = hashedPassword
    
    await user.save()

    const token = jwt.sign({ _id: user }, config.JWT_SECERT as string, {
      expiresIn: config.EXPIRES_IN,
    })

    res.header('x-auth-header', token)

    res.status(200).json('user added successfully')
  } catch (err) {
    res.status(500).json({ message: 'Internal server error: ', err })
  }
}

const authUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = (await User.findOne({ email: email })) as any

    if (!user) return res.status(404).json('user credentionals')

    if (!bcrypt.compareSync(password, user.password))
      return res.status(404).json('Wrong credentionals')

    const token = jwt.sign({ _id: user }, config.JWT_SECERT as string, {
      expiresIn: config.EXPIRES_IN,
    })

    res.header('x-auth-header', token)

  } catch (err) {
    res.status(500).json({ message: 'Internal server error: ', err })
  }
}

const getAllusers = async (_req: Request, res: Response) => {
  try {
    let user = await User.find()
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Internal server error: ', err })
  }
}

const getSpecificUser = async (req: Request, res: Response) => {
  let user
  try {
    user = (await User.findOne({ _id: req.params.id })) as any

    if (!user) return res.status(404).json('user does not exists')

    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Internal server error: ', err })
  }
}

export default {
  createUser,
  getAllusers,
  getSpecificUser,
  authUser,
}
