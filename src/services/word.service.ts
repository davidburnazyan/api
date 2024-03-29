import { Request } from 'express';
import { Types } from 'mongoose';
import { Service, Inject } from 'typedi';

import { WordRepository } from '../repositories/word.repository';
import { GroupRepository } from '../repositories/group.repository';

@Service()
export class WordService {

    constructor(
        @Inject() private readonly wordRepository: WordRepository,
        @Inject() private readonly groupRepository: GroupRepository,
    ) {
    }

    async getAll(req: Request) {
        try {
            if (req.body?.en) {
                return await this.wordRepository.findByName(req)
            }

            return await this.wordRepository.findAll()
        } catch (err: any) {
            return { message: 'Something went wrong' };
        }
    }

    async getRandom() {
        try {
            return await this.wordRepository.findRandom()
        } catch (err: any) {
            return { message: 'Something went wrong' };
        }
    }

    async create(req: Request) {
        try {
            const isWordAlreadyExist = await this.wordRepository.isExist(req)


            if (isWordAlreadyExist.length) {
                return {
                    message: 'Probably word already exist.',
                    data: isWordAlreadyExist
                };
            }

            let lastCreatedGroup = await this.groupRepository.findLastOne()

            if (!lastCreatedGroup) {
                lastCreatedGroup = await this.groupRepository.create({ name: 1 })
            }

            const wordsByGroup = await this.wordRepository.findAllByGroup(lastCreatedGroup._id)

            if (wordsByGroup.length >= 10) {
                // Why 10 because start from 0
                const groupsCount = await this.groupRepository.countDocuments()
                lastCreatedGroup = await this.groupRepository.create({ name: groupsCount + 1 })
            }

            const response = await this.wordRepository.create({
                en: req.body.en,
                arm: req.body.arm,
                group: lastCreatedGroup._id
            });

            return {
                message: 'Word successfully added.',
                data: response,
            }

        } catch (err) {
            return { message: 'Something went wrong' };
        }
    }

    async createByArray(req: Request) {
        try {
            const { array } = req.body

            if (!array?.length) return { message: 'Something went wrong' }

            for (let i = 0; i < array.length; i++) {
                const { en, arm } = array[i]
                let lastCreatedGroup = await this.groupRepository.findLastOne()

                if (!lastCreatedGroup) {
                    lastCreatedGroup = await this.groupRepository.create({ name: 1 })
                }

                const wordsByGroup = await this.wordRepository.findAllByGroup(lastCreatedGroup._id)

                if (wordsByGroup.length >= 10) {
                    // Why 10 because start from 0
                    const groupsCount = await this.groupRepository.countDocuments()
                    lastCreatedGroup = await this.groupRepository.create({ name: groupsCount + 1 })
                }

                await this.wordRepository.create({
                    en,
                    arm,
                    group: lastCreatedGroup._id
                });
            }


            return {
                message: 'Array information successfully added.',
            }

        } catch (err) {
            return { message: 'Something went wrong' };
        }
    }

    async update(id: Types.ObjectId, req: Request) {
        try {
            const checkExist = await this.wordRepository.findById(id)
            if (!checkExist) return { message: 'The given ID is missing' }

            await checkExist.update(req.body)

            const response = await this.wordRepository.findById(id)

            return {
                message: 'Following items was successfully updated.',
                data: response
            }

        } catch (err) {
            return { message: 'Something went wrong.' };
        }
    }

    async deleteById(id: Types.ObjectId) {
        try {
            const checkExist = this.wordRepository.deleteById(id)

            if (checkExist) {
                return {
                    message: 'Following items was successfully deleted.',
                    data: checkExist,
                };
            }

            return {
                message: 'The given word is missing',
            };
        } catch (err) {
            return { message: 'Something went wrong' };
        }
    }

    async delete(req: Request) {
        try {
            const checkExist = await this.wordRepository.findOneAndDelete(req)

            if (checkExist && Object.keys(checkExist).length) {
                const lastCreatedGroup = await this.groupRepository.findLastOne()

                if (lastCreatedGroup?._id) {
                    const wordsByGroup = await this.wordRepository.findAllByGroup(lastCreatedGroup._id)

                    if (!wordsByGroup.length) {
                        lastCreatedGroup.delete()
                    }
                }

                return {
                    message: 'Following items was successfully deleted.',
                    data: checkExist,
                };
            }

            return {
                message: 'The given word is missing',
            };
        } catch (err) {
            return { message: 'Something went wrong', response: req.body };
        }
    }

    async deleteAll() {
        try {
            return await this.wordRepository.deleteAll()
        } catch (err) {
            return { message: 'Something went wrong' };
        }
    }
}
