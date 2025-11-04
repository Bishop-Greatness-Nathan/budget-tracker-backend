/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from './schema/record.schema';
import { Model } from 'mongoose';
import { RecordType } from 'src/utils/types';

@Injectable()
export class RecordService {
  constructor(@InjectModel(Record.name) private recordModel: Model<Record>) {}

  getAnalysis(records: RecordType[], recordCurrency: string) {
    let currency = recordCurrency;
    let locale = 'en-NG';

    const totals = records?.reduce(
      (
        total: { totalIncome: number; totalExpenditure: number },
        record: RecordType,
      ) => {
        if (record.currency === recordCurrency) {
          if (record.recordType === 'income')
            total.totalIncome += record.amount;

          if (record.recordType === 'expenditure')
            total.totalExpenditure += record.amount;
        }

        currency = record.currency;
        locale = record.locale;

        return total;
      },
      { totalIncome: 0, totalExpenditure: 0 },
    );

    const analysis = {
      totalIncome: totals.totalIncome || 0,
      totalExpenditure: totals.totalExpenditure || 0,
      balance: totals.totalIncome - totals.totalExpenditure || 0,
      currency,
      locale,
    };

    return analysis;
  }

  async createRecord(data: CreateRecordDto) {
    return await this.recordModel.create(data);
  }

  async editRecord({ data, id }: { data: UpdateRecordDto; id: string }) {
    const record = await this.recordModel.findOneAndUpdate({ _id: id }, data, {
      runValidators: true,
      new: true,
    });

    return record;
  }

  async findAll(query) {
    const { id, category, currency, from, to, page, limit } = query;

    const queryObj: any = { currency, createdBy: id };

    if (category !== 'all') {
      queryObj.category = category;
    }

    if (from && to) {
      queryObj.createdAt = { $gte: from, $lte: to };
    }

    const count = await this.recordModel.countDocuments(queryObj);

    const pageNumber = Number(page) || 1;
    const pageLimit = Number(limit);
    const skip = (pageNumber - 1) * pageLimit;
    const numOfPages = Math.ceil(count / pageLimit);

    const records = await this.recordModel
      .find(queryObj)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean<RecordType[]>();

    const allRecords = await this.recordModel
      .find(queryObj)
      .lean<RecordType[]>();
    const analysis = this.getAnalysis(allRecords, currency);

    return { records, analysis, count, numOfPages };
  }

  async findOne(id) {
    const record = await this.recordModel.findById(id);
    return record;
  }

  remove(id: number) {
    return `This action removes a #${id} record`;
  }
}
