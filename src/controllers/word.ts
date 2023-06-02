import { Request, Response } from "express";
import WordModal from "../models/word";
import WordGroupModal from "../models/wordGroup";

export const Create = async (req: Request, res: Response) => {
  try {
    const isWordAlreadyExist = await WordModal
      .find({ $or: [{ 'en': req.body.en }, { 'arm': req.body.arm }] })
      .find({ $or: [{ 'en': { $regex: req.body.en } }, { 'arm': { $regex: req.body.arm } }] })

    if (isWordAlreadyExist.length) {
      return res.json({
        message: 'Probably word already exist.',
        response: isWordAlreadyExist
      });
    }

    let lastCreatedGroup = await WordGroupModal
      .findOne().limit(1).sort({ $natural: -1 })

    if (lastCreatedGroup) { // lastCreatedGroup.length === 0
      lastCreatedGroup = await WordGroupModal.create({ name: 1 })
    }

    if (lastCreatedGroup) {
      const wordsByGroup = await WordModal.find({ group: lastCreatedGroup._id })

      if (wordsByGroup.length >= 1) {
        // Why 10 because start from 0
        const groupsCount = await WordGroupModal.countDocuments()
        lastCreatedGroup = await WordGroupModal.create({ name: groupsCount + 1 })
      }
    }



    if (lastCreatedGroup) {
      const response = await WordModal.create({
        en: req.body.en,
        arm: req.body.arm,
        group: lastCreatedGroup._id
      });

      return res.json({
        message: 'Word successfully added.',
        response,
      });
    }

    return res.json({
      message: 'Something went wrong',
    });
  } catch (err) {
    res.json({ message: 'Something went wrong' });
  }
};

export const Read = async (req: Request, res: Response) => {
  try {
    if (req.body?.en) {
      const response = await WordModal
        .find({ $or: [{ 'en': { $regex: req.body.en } }] })

      return res.json({ response });
    }

    const response = await WordModal.find();

    return res.json({ response });
  } catch (err) {
    res.json({ message: 'Something went wrong' });
  }
};

export const Update = async (req: Request, res: Response) => {
  try {
    const checkExist = await WordModal
      .findOneAndUpdate({ $or: [{ 'en': req.body.find.en }, { 'arm': req.body.find.arm }] }, req.body.update)


    if (checkExist && Object.keys(checkExist).length) {
      return res.json({
        message: 'Following items was successfully updated.',
        response: checkExist
      });
    }

    return res.json({
      message: 'The given word is missing',
      response: req.body.find
    });

  } catch (err) {
    res.json({ message: 'Something went wrong' });
  }
};

export const Delete = async (req: Request, res: Response) => {
  try {

    const checkExist = await WordModal
      .findOneAndDelete({ $or: [{ 'en': req.body.en }, { 'arm': req.body.arm }] })


    if (checkExist && Object.keys(checkExist).length) {
      return res.json({
        message: 'Following items was successfully deleted.',
        response: checkExist
      });
    }

    return res.json({
      message: 'The given word is missing',
    });
  } catch (err) {
    res.json({ message: 'Something went wrong', response: req.body });
  }
};

export const ReadByGroup = async (req: Request, res: Response) => {
  try {
    // Add logic if there are group id or name get by these
    const lastCreatedGroup = await WordGroupModal
      .findOne().limit(1).sort({ $natural: -1 })

    if (lastCreatedGroup) {
      const wordsByGroup = await WordModal.find({ group: lastCreatedGroup._id })

      return res.json({
        group: {
          name: lastCreatedGroup.name,
          words: wordsByGroup
        }
      });
    }

    return res.json({
      message: 'Something went wrong',
    });
  } catch (err) {
    res.json({ message: 'Something went wrong' });
  }
};
