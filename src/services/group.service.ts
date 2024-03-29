import { Service, Inject } from "typedi";
import { WordRepository } from "../repositories/word.repository";
import { GroupRepository } from "../repositories/group.repository";
import { Types } from "mongoose";

@Service()
export class GroupService {
  constructor(
    @Inject() private readonly wordRepository: WordRepository,
    @Inject() private readonly groupRepository: GroupRepository
  ) { }

  async getLastOne() {
    try {
      const lastCreatedGroup = await this.groupRepository.findLastOne();

      if (!lastCreatedGroup) {
        return {
          message: "Group is missing.",
        };
      }

      const wordsByGroup = await this.wordRepository.findAllByGroup(
        lastCreatedGroup._id
      );

      return {
        group: {
          name: lastCreatedGroup.name,
          words: wordsByGroup,
        },
      };
    } catch (error) {
      console.log("Error :", error);

      return {
        message: "Something went wrong.",
      };
    }
  }

  async getAll() {
    try {
      const response = await this.groupRepository.findAll();

      return response;
    } catch (error) {
      console.log("Error :", error);

      return {
        message: "Something went wrong.",
      };
    }
  }

  async getById(id: Types.ObjectId) {
    try {
      const group = await this.groupRepository.findById(id);

      if (!group?._id) {
        return { message: "The group is missing." };
      }
      const wordsByGroup = await this.wordRepository.findAllByGroup(group._id);

      return {
        data: {
          _id: group._id,
          name: group.name,
          words: wordsByGroup,
        },
      };


      return {
        message: "Words are missing",
      };
    } catch (error) {
      console.log("Error :", error);

      return {
        message: "Something went wrong.",
      };
    }
  }

  async deleteAll() {
    try {
      return await this.groupRepository.deleteAll()
    } catch (err) {
      return { message: 'Something went wrong' };
    }
  }

}
